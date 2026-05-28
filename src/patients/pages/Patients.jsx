import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  Bell,
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  UserRound,
  Users,
  X
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Layout from "../../components/Layout";

import { apiUrl } from "../../config/api";


// ─── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
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
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
}

function patientCode(patient) {
  return patient.patient_id || `QC-${String(patient.id || 0).padStart(4, "0")}`;
}


// ─── Status ───────────────────────────────────────────────────────────────────

function deriveStatus(patient) {
  if (patient.status) return patient.status;
  const hasFollowUp =
    patient.follow_up_date ||
    patient.has_pending_follow_up;
  if (hasFollowUp) return "Follow-up";
  const count = Number(patient.appointment_count || patient.total_appointments || 0);
  if (count <= 1) return "New";
  return "Active";
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  let cls = "bg-slate-100 text-slate-600";
  if (s === "active") cls = "bg-teal-50 text-teal-700";
  else if (s === "follow-up") cls = "bg-amber-50 text-amber-700";
  else if (s === "new") cls = "bg-blue-50 text-blue-700";
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {status || "Active"}
    </span>
  );
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value.includes("T") ? value : `${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    }).format(d);
  } catch {
    return value;
  }
}


// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <Icon size={22} />
      </div>
    </div>
  );
}


// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50";


// ─── Main component ───────────────────────────────────────────────────────────

export default function Patients() {

  const navigate = useNavigate();
  const clinicId = localStorage.getItem("clinic_id");

  // ─── Data ─────────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [lastVisitSort, setLastVisitSort] = useState("recent");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // ─── Pagination ───────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "", phone_number: "", age: "", gender: "", health_issue: ""
  });

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const [patientsRes, doctorsRes] = await Promise.all([
        axios.get(apiUrl("/patients"), { params: { clinic_id: clinicId } }),
        axios.get(apiUrl("/doctors"), { params: { clinic_id: clinicId } })
      ]);

      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);

      const activeDoctors = Array.isArray(doctorsRes.data)
        ? doctorsRes.data.filter((d) => d.is_active !== false)
        : [];

      setDoctors(activeDoctors);

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to load patients");

    } finally {

      setLoading(false);
    }

  }, [clinicId]);

  useEffect(() => {
    const t = window.setTimeout(fetchAll, 0);
    return () => window.clearTimeout(t);
  }, [fetchAll]);

  // ─── Doctor options ───────────────────────────────────────────────────────
  const doctorOptions = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => {
      const id = String(d.id || d.doctor_name || d.name);
      if (!id || map.has(id)) return;
      map.set(id, { id, doctor_name: d.doctor_name || d.name });
    });
    patients.forEach((p) => {
      const id = p.doctor_id ? String(p.doctor_id) : p.doctor_name;
      if (!id || map.has(id)) return;
      map.set(id, { id, doctor_name: p.doctor_name });
    });
    return Array.from(map.values());
  }, [doctors, patients]);

  const effectiveDoctorFilter =
    doctorOptions.length === 1 ? doctorOptions[0].id : doctorFilter;

  const selectedDoctor =
    doctorOptions.find((d) => d.id === effectiveDoctorFilter);

  // ─── Enhanced patients (computed status, last visit etc.) ─────────────────
  const enhancedPatients = useMemo(() => {

    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return patients.map((p) => {

      const status = deriveStatus(p);

      const isNewThisMonth = p.created_at
        ? new Date(p.created_at) >= thisMonthStart
        : false;

      return {
        ...p,
        _status: status,
        _is_new_this_month: isNewThisMonth,
        _appointment_count: Number(p.appointment_count || p.total_appointments || 0),
        _last_visit: p.last_visit || p.last_appointment_date || null,
        _health_issue: p.health_issue || p.last_problem || null
      };
    });

  }, [patients]);

  // ─── Filtered + sorted patients ───────────────────────────────────────────
  const filteredPatients = useMemo(() => {

    const q = search.trim().toLowerCase();

    let list = enhancedPatients.filter((p) => {

      const matchGender =
        genderFilter === "all" || p.gender === genderFilter;

      const matchDoctor =
        effectiveDoctorFilter === "all" ||
        String(p.doctor_id || "") === effectiveDoctorFilter ||
        p.doctor_name === selectedDoctor?.doctor_name;

      const searchable = [
        p.name, p.phone_number, p.gender,
        String(p.age || ""), patientCode(p), p._health_issue
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchGender && matchDoctor && (!q || searchable.includes(q));
    });

    list = [...list].sort((a, b) => {

      const av = a._last_visit || a.created_at || "";
      const bv = b._last_visit || b.created_at || "";

      return lastVisitSort === "recent"
        ? bv.localeCompare(av)
        : av.localeCompare(bv);
    });

    return list;

  }, [enhancedPatients, search, genderFilter, effectiveDoctorFilter, selectedDoctor, lastVisitSort]);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {

    const total = patients.length;

    const newThisMonth = enhancedPatients.filter((p) => p._is_new_this_month).length;

    const followUp = enhancedPatients.filter((p) => p._status === "Follow-up").length;

    const avgAge = patients.length
      ? Math.round(
          patients.reduce((sum, p) => sum + Number(p.age || 0), 0) / patients.length
        )
      : 0;

    return { total, newThisMonth, followUp, avgAge };

  }, [patients, enhancedPatients]);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));

  const pagedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => { setCurrentPage(1); }, [search, genderFilter, lastVisitSort, doctorFilter, pageSize]);

  // ─── Gender options ───────────────────────────────────────────────────────
  const genderOptions = useMemo(() => [
    "all",
    ...new Set(patients.map((p) => p.gender).filter(Boolean))
  ], [patients]);

  // ─── Add patient ─────────────────────────────────────────────────────────
  const addPatient = useCallback(async (e) => {

    e.preventDefault();

    try {

      setAdding(true);
      setError("");

      await axios.post(apiUrl("/patients"), {
        clinic_id: Number(clinicId),
        ...addForm,
        age: addForm.age ? Number(addForm.age) : undefined
      });

      setAddForm({ name: "", phone_number: "", age: "", gender: "", health_issue: "" });
      setShowAddModal(false);
      await fetchAll();

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to add patient");

    } finally {

      setAdding(false);
    }

  }, [addForm, clinicId, fetchAll]);

  // ─── Send reminder ────────────────────────────────────────────────────────
  const sendReminder = useCallback(async (patient) => {

    setOpenMenuId(null);

    try {

      setSendingId(patient.id);

      await axios.post(apiUrl("/patients/remind"), {
        clinic_id: Number(clinicId),
        patient_id: patient.id,
        phone_number: patient.phone_number
      });

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to send reminder");

    } finally {

      setSendingId(null);
    }

  }, [clinicId]);

  return (
    <Layout
      title={`Patients${selectedDoctor ? ` — ${selectedDoctor.doctor_name}` : ""}`}
      subtitle={selectedDoctor ? `Browse patient records, recent visits, and follow-up history for ${selectedDoctor.doctor_name}.` : "Browse patient records, recent visits, and follow-up history."}
      actions={(
        <div className="flex items-center gap-2">
          {doctorOptions.length > 1 && (
            <div className="relative">
              <UserRound
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={effectiveDoctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="min-h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-6 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="all">All doctors</option>
                {doctorOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.doctor_name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Add Patient
          </button>
          <button
            type="button"
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      )}
    >

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Showing chip */}
      {selectedDoctor && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-sm text-teal-700">
          <Info size={14} />
          Showing patients for{" "}
          <span className="font-semibold">{selectedDoctor.doctor_name}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total patients" value={stats.total} icon={Users} />
        <StatCard label="New this month" value={stats.newThisMonth} icon={UserPlus} />
        <StatCard label="Follow-up patients" value={stats.followUp} icon={CalendarClock} />
        <StatCard label="Average age" value={stats.avgAge || "—"} icon={UserRound} />
      </div>

      {/* Patient list */}
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Section header + filters */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Patient list</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredPatients.length || 0)}
              {" to "}
              {Math.min(currentPage * pageSize, filteredPatients.length)}
              {" of "}
              {filteredPatients.length} patients
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 sm:min-w-56">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input
                type="search"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              {genderOptions.map((g) => (
                <option key={g} value={g}>
                  {g === "all" ? "Gender" : g}
                </option>
              ))}
            </select>
            <select
              value={lastVisitSort}
              onChange={(e) => setLastVisitSort(e.target.value)}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="recent">Last visit</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-slate-500">
            <Loader2 className="mr-2 animate-spin text-teal-600" size={18} />
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-slate-700">No patients found.</p>
            <p className="mt-1 text-sm text-slate-500">Try changing the search or filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Patient", "Age", "Gender", "Phone", "Last visit", "Appointments", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50/60"
                    >
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(patient.id)}`}>
                            {initials(patient.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{patient.name || "Patient"}</p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {patientCode(patient)}
                              {patient._health_issue ? ` · ${patient._health_issue}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="px-5 py-4 text-slate-700">
                        {patient.age || "—"}
                      </td>

                      {/* Gender */}
                      <td className="px-5 py-4 text-slate-700">
                        {patient.gender || "—"}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-slate-700">
                        {patient.phone_number || "—"}
                      </td>

                      {/* Last visit */}
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatDate(patient._last_visit || patient.created_at)}
                      </td>

                      {/* Appointments */}
                      <td className="px-5 py-4 text-center text-slate-700">
                        {patient._appointment_count || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={patient._status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                            disabled={sendingId === patient.id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                          >
                            {sendingId === patient.id
                              ? <Loader2 size={15} className="animate-spin" />
                              : <MoreVertical size={15} />
                            }
                          </button>

                          {openMenuId === patient.id && (
                            <div className="absolute right-0 top-9 z-20 min-w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(null)}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <UserRound size={14} className="text-slate-400" />
                                View profile
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate("/appointments");
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <BookOpen size={14} className="text-slate-400" />
                                Book appointment
                              </button>
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(null)}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Clock size={14} className="text-slate-400" />
                                View history
                              </button>
                              <button
                                type="button"
                                onClick={() => sendReminder(patient)}
                                disabled={!patient.phone_number}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Bell size={14} className="text-slate-400" />
                                Send reminder
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-teal-500"
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`el-${idx}`} className="px-1 text-sm text-slate-400">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${
                          currentPage === p
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ─── Add Patient Modal ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Add Patient</h2>
                <p className="mt-0.5 text-sm text-slate-500">Create a new patient record.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={addPatient} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Full name">
                      <input
                        type="text"
                        placeholder="Patient name"
                        value={addForm.name}
                        onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                        className={inputCls}
                        required
                        autoFocus
                      />
                    </Field>
                  </div>
                  <Field label="Phone number">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={addForm.phone_number}
                      onChange={(e) => setAddForm((f) => ({ ...f, phone_number: e.target.value }))}
                      className={inputCls}
                      required
                    />
                  </Field>
                  <Field label="Age">
                    <input
                      type="number"
                      placeholder="Age"
                      min="0"
                      max="150"
                      value={addForm.age}
                      onChange={(e) => setAddForm((f) => ({ ...f, age: e.target.value }))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      value={addForm.gender}
                      onChange={(e) => setAddForm((f) => ({ ...f, gender: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Health issue (optional)">
                    <input
                      type="text"
                      placeholder="e.g. Diabetes, Hypertension"
                      value={addForm.health_issue}
                      onChange={(e) => setAddForm((f) => ({ ...f, health_issue: e.target.value }))}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding || !addForm.name || !addForm.phone_number}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {adding ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <UserPlus size={15} />
                    )}
                    Add Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Close three-dot menu on outside click */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}

    </Layout>
  );
}
