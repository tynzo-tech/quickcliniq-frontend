import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
  X
} from "lucide-react";

import Layout from "../../components/Layout";
import Pagination from "../../components/Pagination";

import { apiUrl } from "../../config/api";


const WEEK_DAYS = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
];

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700"
];

function avatarColor(id) {
  return AVATAR_COLORS[Number(id || 0) % AVATAR_COLORS.length];
}

function initials(name) {
  return (name || "D")
    .replace(/^Dr\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "D";
}

function isAvailableToday(doctor) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = dayNames[new Date().getDay()];
  return (
    doctor.is_active &&
    (doctor.working_days || "").split(",").includes(today)
  );
}

function nextAvailableLabel(doctor) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const workingDays = (doctor.working_days || "").split(",").filter(Boolean);
  if (!workingDays.length || !doctor.is_active) return null;
  const todayIdx = new Date().getDay();
  for (let i = 1; i <= 7; i++) {
    const dayIdx = (todayIdx + i) % 7;
    if (workingDays.includes(dayNames[dayIdx])) {
      return i === 1 ? "tomorrow" : dayNames[dayIdx];
    }
  }
  return null;
}

function StatIcon({ icon, className }) {
  if (icon === "users") return <Users size={20} className={className} />;
  if (icon === "check") return <CheckCircle2 size={20} className={className} />;
  if (icon === "stethoscope") return <Stethoscope size={20} className={className} />;
  if (icon === "clock") return <Clock size={20} className={className} />;
  return null;
}

function StatCard({ label, value, icon, bg, iconColor }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg}`}>
          <StatIcon icon={icon} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

function emptyForm(clinicId) {
  return {
    clinic_id: Number(clinicId),
    name: "",
    specialization: "",
    phone_number: "",
    email: "",
    working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    start_time: "09:00",
    end_time: "17:00",
    break_start: "",
    break_end: "",
    consultation_duration: 10
  };
}


export default function Doctors() {

  const navigate = useNavigate();
  const clinicId = localStorage.getItem("clinic_id");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm(clinicId));
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState({ msg: "", error: false });

  const showToast = (message, error = false) => {
    setToast({ msg: message, error });
    window.setTimeout(
      () => setToast({ msg: "", error: false }),
      3500
    );
  };


  const loadDoctors = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        apiUrl("/doctors"),
        {
          params: {
            clinic_id: Number(clinicId),
            include_inactive: true
          }
        }
      );

      setDoctors(
        Array.isArray(res.data) ? res.data : []
      );

    } catch (e) {

      showToast(
        e.response?.data?.detail || "Failed to load doctors",
        true
      );

    } finally {

      setLoading(false);
    }

  }, [clinicId]);


  useEffect(() => {

    const t = window.setTimeout(loadDoctors, 0);
    return () => window.clearTimeout(t);

  }, [loadDoctors]);


  // Primary doctor = lowest ID (first registered)
  const primaryId = useMemo(() => {

    if (!doctors.length) return null;
    return Math.min(...doctors.map((d) => d.id));

  }, [doctors]);


  // Stats
  const stats = useMemo(() => {

    const total = doctors.length;
    const active = doctors.filter((d) => d.is_active).length;
    const specs = new Set(
      doctors.map((d) => d.specialization).filter(Boolean)
    ).size;
    const availableToday = doctors.filter(isAvailableToday).length;

    return { total, active, specs, availableToday };

  }, [doctors]);


  // Unique specializations for filter dropdown
  const specializations = useMemo(() => {

    return [
      ...new Set(
        doctors.map((d) => d.specialization).filter(Boolean)
      )
    ].sort();

  }, [doctors]);


  // Filtered list
  const filtered = useMemo(() => {

    const q = search.trim().toLowerCase();

    return doctors.filter((d) => {

      if (q) {
        const match =
          (d.name || "").toLowerCase().includes(q) ||
          (d.doctor_name || "").toLowerCase().includes(q) ||
          (d.specialization || "").toLowerCase().includes(q) ||
          (d.phone_number || "").includes(q);
        if (!match) return false;
      }

      if (specFilter !== "all" && d.specialization !== specFilter) return false;

      if (statusFilter === "active" && !d.is_active) return false;
      if (statusFilter === "inactive" && d.is_active) return false;

      return true;
    });

  }, [doctors, search, specFilter, statusFilter]);


  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, specFilter, statusFilter, pageSize]);


  const updateForm = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleDay = (day) => {
    setForm((f) => {
      const sel = f.working_days.includes(day);
      return {
        ...f,
        working_days: sel
          ? f.working_days.filter((d) => d !== day)
          : [...f.working_days, day]
      };
    });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(clinicId));
    setShowForm(true);
  };

  const openEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({
      clinic_id: Number(clinicId),
      name: doctor.name || doctor.doctor_name || "",
      specialization: doctor.specialization || "",
      phone_number: doctor.phone_number || "",
      email: doctor.email || "",
      consultation_duration: doctor.consultation_duration || 10,
      working_days: doctor.working_days
        ? doctor.working_days.split(",").filter(Boolean)
        : ["Mon", "Tue", "Wed", "Thu", "Fri"],
      start_time: doctor.start_time || "09:00",
      end_time: doctor.end_time || "17:00",
      break_start: doctor.break_start || "",
      break_end: doctor.break_end || ""
    });
    setShowForm(true);
    setOpenMenuId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm(clinicId));
  };

  const saveDoctor = async (e) => {

    e.preventDefault();

    if (!form.working_days.length) {
      showToast("Select at least one working day.", true);
      return;
    }

    try {

      setSaving(true);

      const payload = {
        ...form,
        break_start: form.break_start || null,
        break_end: form.break_end || null,
        consultation_duration: Number(form.consultation_duration)
      };

      if (editingId) {
        await axios.put(apiUrl(`/doctors/${editingId}`), payload);
      } else {
        await axios.post(apiUrl("/doctors"), payload);
      }

      closeForm();
      await loadDoctors();
      showToast(editingId ? "Doctor updated." : "Doctor added.");

    } catch (e) {

      showToast(
        e.response?.data?.detail || "Failed to save doctor",
        true
      );

    } finally {

      setSaving(false);
    }
  };


  const confirmDelete = async () => {

    if (!deleteTarget) return;

    try {

      setDeleting(true);

      await axios.delete(
        apiUrl(`/doctors/${deleteTarget.id}`),
        { params: { clinic_id: Number(clinicId) } }
      );

      setDeleteTarget(null);
      await loadDoctors();
      showToast("Doctor removed.");

    } catch (e) {

      showToast(
        e.response?.data?.detail || "Failed to remove doctor",
        true
      );

    } finally {

      setDeleting(false);
    }
  };


  return (
    <Layout
      title="Doctors"
      subtitle="Manage doctors, specialties, and availability in your clinic."
      actions={(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDoctors}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Add Doctor
          </button>
        </div>
      )}
    >

      {/* Toast */}
      {toast.msg && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
          toast.error
            ? "border-red-100 bg-red-50 text-red-700"
            : "border-teal-100 bg-teal-50 text-teal-700"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total doctors"
          value={stats.total}
          icon="users"
          bg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon="check"
          bg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          label="Specializations"
          value={stats.specs}
          icon="stethoscope"
          bg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Available today"
          value={stats.availableToday}
          icon="clock"
          bg="bg-orange-50"
          iconColor="text-orange-500"
        />
      </div>

      {/* Table card */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">

        {/* Card header: title + filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Doctors list
          </h2>
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-9 w-52 rounded-lg border border-slate-200 pl-8 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              />
            </div>

            {/* Specializations filter */}
            <div className="relative">
              <select
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                className="min-h-9 appearance-none rounded-lg border border-slate-200 pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              >
                <option value="all">All Specializations</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-h-9 appearance-none rounded-lg border border-slate-200 pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

          </div>
        </div>

        {/* Table body */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={24} className="mx-auto mb-3 animate-spin text-teal-600" />
            <p className="text-sm text-slate-500">Loading doctors...</p>
          </div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            {doctors.length === 0
              ? "No doctors configured."
              : "No doctors match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Specialization</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((doctor) => {

                  const isPrimary = doctor.id === primaryId;
                  const available = isAvailableToday(doctor);
                  const nextLabel = nextAvailableLabel(doctor);
                  const timeRange =
                    doctor.start_time && doctor.end_time
                      ? `${doctor.start_time} – ${doctor.end_time}`
                      : "";

                  return (
                    <tr
                      key={doctor.id}
                      className="bg-white hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(doctor.id)}`}>
                            {initials(doctor.name || doctor.doctor_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950">
                              {doctor.doctor_name || doctor.name}
                            </p>
                            {isPrimary && (
                              <span className="mt-0.5 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                                Primary doctor
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Specialization */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Stethoscope size={14} className="shrink-0 text-slate-400" />
                          {doctor.specialization || "—"}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={14} className="shrink-0 text-slate-400" />
                          {doctor.phone_number || "—"}
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="px-5 py-4">
                        {!doctor.is_active ? (
                          <span className="text-xs text-slate-400">Inactive</span>
                        ) : available ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                              <span className="text-xs font-medium text-green-700">
                                Available today
                              </span>
                            </div>
                            {timeRange && (
                              <p className="mt-0.5 text-xs text-slate-500">{timeRange}</p>
                            )}
                          </div>
                        ) : nextLabel ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                              <span className="text-xs font-medium text-orange-700">
                                Next available {nextLabel}
                              </span>
                            </div>
                            {timeRange && (
                              <p className="mt-0.5 text-xs text-slate-500">{timeRange}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No schedule</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          doctor.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {doctor.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="relative flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === doctor.id ? null : doctor.id
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            <MoreVertical size={15} />
                          </button>

                          {openMenuId === doctor.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <UserRound size={14} className="text-slate-400" />
                                  View profile
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEdit(doctor)}
                                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil size={14} className="text-slate-400" />
                                  Edit doctor
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    navigate("/slots");
                                  }}
                                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Calendar size={14} className="text-slate-400" />
                                  View schedule
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeleteTarget(doctor);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} className="text-red-400" />
                                  Remove
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="doctors"
        />

        {/* Info note */}
        <div className="border-t border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Info size={14} className="shrink-0 text-slate-400" />
            Manage doctor profiles, schedules, and booking availability from one place.
          </div>
        </div>
      </div>


      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <form
            onSubmit={saveDoctor}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-950">
                {editingId ? "Edit doctor" : "Add doctor"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Doctor name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sriharsha"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="w-full min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. General Medicine"
                  value={form.specialization}
                  onChange={(e) => updateForm("specialization", e.target.value)}
                  className="w-full min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Phone number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 8297997929"
                  value={form.phone_number}
                  onChange={(e) => updateForm("phone_number", e.target.value)}
                  className="w-full min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Start time *
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => updateForm("start_time", e.target.value)}
                  className="w-full min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  End time *
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => updateForm("end_time", e.target.value)}
                  className="w-full min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Slot duration (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={form.consultation_duration}
                  onChange={(e) =>
                    updateForm("consultation_duration", e.target.value)
                  }
                  className="w-full min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Working days *
                </label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        form.working_days.includes(day)
                          ? "border-teal-700 bg-teal-700 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                {saving && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {editingId ? "Save changes" : "Add doctor"}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Remove confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-slate-950">
              Remove this doctor?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              <strong>{deleteTarget.doctor_name || deleteTarget.name}</strong> will
              be removed from your clinic. This cannot be undone.
            </p>
            {deleteTarget.id === primaryId && (
              <p className="mt-2 text-sm font-medium text-amber-700">
                Warning: this is your primary doctor.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
