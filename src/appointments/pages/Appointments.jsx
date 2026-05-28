import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  Ban,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X
} from "lucide-react";

import Layout from "../../components/Layout";

import { apiUrl } from "../../config/api";


const PAGE_SIZE = 15;


function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        <Icon size={22} className="text-slate-400" />
      </div>
    </div>
  );
}


function StatusBadge({ status }) {

  const s = String(status || "").toLowerCase();

  let cls = "bg-slate-100 text-slate-600";
  let label = status || "Pending";

  if (s.includes("book") || s.includes("confirm")) {
    cls = "bg-teal-50 text-teal-700";
    label = "Booked";
  } else if (s.includes("cancel")) {
    cls = "bg-red-50 text-red-700";
    label = "Cancelled";
  } else if (s.includes("no") && s.includes("show")) {
    cls = "bg-orange-50 text-orange-700";
    label = "No-show";
  } else if (s.includes("complet")) {
    cls = "bg-green-50 text-green-700";
    label = "Completed";
  }

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}


function formatDate(value) {

  if (!value) return null;

  try {

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(`${value}T00:00:00`));

  } catch {

    return value;
  }
}


function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}


const inputCls =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50";


export default function Appointments() {

  const clinicId = localStorage.getItem("clinic_id");
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();

  // ─── Data ───────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Filters ────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // ─── UI state ───────────────────────────────────────
  const [activeTab, setActiveTab] = useState("appointments");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  // ─── Action states ──────────────────────────────────
  const [cancellingId, setCancellingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  // ─── Create appointment modal ────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [manualSlots, setManualSlots] = useState([]);
  const [manualForm, setManualForm] = useState({
    doctor_id: "",
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    follow_up_date: "",
    patient_name: "",
    patient_age: "",
    patient_gender: "",
    phone_number: "",
    health_issue: ""
  });

  // ─── Follow-up modal ────────────────────────────────
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedForFollowUp, setSelectedForFollowUp] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // ─── Reminders ──────────────────────────────────────
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [reminderSentIds, setReminderSentIds] = useState(new Set());

  // ─── Fetch ──────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const [apptRes, shiftsRes, doctorsRes] = await Promise.all([
        axios.get(apiUrl("/appointments"), { params: { clinic_id: clinicId } }),
        axios.get(apiUrl(`/shifts/${clinicId}`)),
        axios.get(apiUrl("/doctors"), { params: { clinic_id: clinicId } })
      ]);

      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);

      const activeShifts = Array.isArray(shiftsRes.data)
        ? shiftsRes.data.filter((s) => s.is_active)
        : [];

      setShifts(activeShifts);

      const activeDoctors = Array.isArray(doctorsRes.data)
        ? doctorsRes.data.filter((d) => d.is_active !== false)
        : [];

      setDoctors(activeDoctors);

      setManualForm((f) => ({
        ...f,
        doctor_id: f.doctor_id || activeDoctors[0]?.id || activeShifts[0]?.doctor_id || "",
        doctor_name:
          f.doctor_name ||
          activeDoctors[0]?.name ||
          activeDoctors[0]?.doctor_name ||
          activeShifts[0]?.doctor_name ||
          ""
      }));

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to load appointments");

    } finally {

      setLoading(false);
    }

  }, [clinicId]);

  useEffect(() => {

    const t = window.setTimeout(fetchAppointments, 0);
    return () => window.clearTimeout(t);

  }, [fetchAppointments]);

  // ─── Doctor options ─────────────────────────────────
  const doctorOptions = useMemo(() => {

    const map = new Map();

    doctors.forEach((d) => {
      const id = d.id ? String(d.id) : d.doctor_name || d.name;
      if (!id || map.has(id)) return;
      map.set(id, { id, doctor_id: d.id || "", doctor_name: d.doctor_name || d.name });
    });

    shifts.forEach((s) => {
      const id = s.doctor_id ? String(s.doctor_id) : s.doctor_name;
      if (!id || map.has(id)) return;
      map.set(id, { id, doctor_id: s.doctor_id || "", doctor_name: s.doctor_name });
    });

    appointments.forEach((a) => {
      const id = a.doctor_id ? String(a.doctor_id) : a.doctor_name;
      if (!id || map.has(id)) return;
      map.set(id, { id, doctor_id: a.doctor_id || "", doctor_name: a.doctor_name });
    });

    return Array.from(map.values());

  }, [appointments, doctors, shifts]);

  const effectiveDoctorFilter =
    doctorOptions.length === 1 ? doctorOptions[0].id : doctorFilter;

  const selectedDoctor =
    doctorOptions.find((d) => d.id === effectiveDoctorFilter);

  // ─── Filtered appointments ───────────────────────────
  const filteredAppointments = useMemo(() => {

    const q = query.trim().toLowerCase();

    return appointments.filter((a) => {

      const matchStatus =
        statusFilter === "all" || a.status === statusFilter;

      const matchDoctor =
        effectiveDoctorFilter === "all" ||
        String(a.doctor_id || "") === effectiveDoctorFilter ||
        (!a.doctor_id && selectedDoctor?.doctor_name && a.doctor_name === selectedDoctor.doctor_name);

      const searchable = [
        a.patient_name,
        a.phone_number,
        a.gender,
        a.doctor_name,
        a.problem,
        a.appointment_date,
        a.appointment_time
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchStatus && matchDoctor && (!q || searchable.includes(q));
    });

  }, [appointments, effectiveDoctorFilter, query, selectedDoctor, statusFilter]);

  // ─── Time sort helper ────────────────────────────────
  const sortByTime = (a, b) => {
    const toMin = (t) => {
      if (!t) return 0;
      const [time, period] = t.split(" ");
      const [h, m] = (time || "0:0").split(":").map(Number);
      const hour = period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h;
      return hour * 60 + (m || 0);
    };
    return toMin(a.appointment_time) - toMin(b.appointment_time);
  };

  // ─── Grouped views ───────────────────────────────────
  const todayAppts = useMemo(() =>
    filteredAppointments.filter((a) => a.appointment_date === todayStr).sort(sortByTime),
    [filteredAppointments, todayStr] // eslint-disable-line
  );

  const tomorrowAppts = useMemo(() =>
    filteredAppointments.filter((a) => a.appointment_date === tomorrowStr).sort(sortByTime),
    [filteredAppointments, tomorrowStr] // eslint-disable-line
  );

  const upcomingAppts = useMemo(() =>
    filteredAppointments
      .filter((a) => a.appointment_date > tomorrowStr)
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || sortByTime(a, b)),
    [filteredAppointments, tomorrowStr] // eslint-disable-line
  );

  // ─── Stats (from all appointments) ──────────────────
  const stats = useMemo(() => {

    return {
      total: appointments.length,
      booked: appointments.filter((a) =>
        String(a.status || "").toLowerCase().includes("book")
      ).length,
      cancelled: appointments.filter((a) =>
        String(a.status || "").toLowerCase().includes("cancel")
      ).length,
      noShow: appointments.filter((a) => {
        const s = String(a.status || "").toLowerCase();
        return s.includes("no") && s.includes("show");
      }).length,
      followUps: appointments.filter((a) =>
        a.follow_up_date && a.status !== "cancelled"
      ).length,
      today: appointments.filter((a) =>
        a.appointment_date === todayStr
      ).length
    };

  }, [appointments, todayStr]);

  // ─── Follow-ups list ────────────────────────────────
  const followUps = useMemo(() => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments
      .filter((a) => a.follow_up_date && a.status !== "cancelled")
      .map((a) => {
        const followDay = new Date(`${a.follow_up_date}T00:00:00`);
        const daysUntil = Math.ceil((followDay - today) / (1000 * 60 * 60 * 24));
        return { ...a, days_until_follow_up: daysUntil };
      })
      .filter((a) => a.days_until_follow_up === 1)
      .sort((a, b) => a.days_until_follow_up - b.days_until_follow_up);

  }, [appointments]);

  // ─── Pagination ─────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));

  const pagedAppointments = filteredAppointments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, doctorFilter, activeTab]);

  // ─── Filters ────────────────────────────────────────
  const hasFilters = query || statusFilter !== "all";

  const clearFilters = useCallback(() => {
    setQuery("");
    setStatusFilter("all");
  }, []);

  // ─── Status options ──────────────────────────────────
  const statusOptions = useMemo(() => [
    "all",
    ...new Set(appointments.map((a) => a.status).filter(Boolean))
  ], [appointments]);

  // ─── Create appointment ──────────────────────────────
  const loadManualSlots = useCallback(async () => {

    if (!manualForm.doctor_name || !manualForm.appointment_date) {
      setError("Choose doctor and appointment date first.");
      return;
    }

    try {

      setSlotLoading(true);
      setError("");

      const res = await axios.get(apiUrl("/available-slots"), {
        params: {
          clinic_id: clinicId,
          doctor_id: manualForm.doctor_id || undefined,
          doctor_name: manualForm.doctor_name,
          appointment_date: manualForm.appointment_date
        }
      });

      setManualSlots(res.data?.slots || []);

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to load slots");

    } finally {

      setSlotLoading(false);
    }

  }, [clinicId, manualForm.appointment_date, manualForm.doctor_id, manualForm.doctor_name]);

  const updateManualForm = useCallback((field, value) => {

    setManualForm((f) => ({
      ...f,
      [field]: value,
      ...(field === "doctor_id"
        ? { doctor_name: doctorOptions.find((d) => d.id === value)?.doctor_name || "" }
        : {}),
      ...((field === "doctor_name" || field === "doctor_id" || field === "appointment_date")
        ? { appointment_time: "" }
        : {})
    }));

    if (field === "doctor_name" || field === "doctor_id" || field === "appointment_date") {
      setManualSlots([]);
    }

  }, [doctorOptions]);

  const createManualAppointment = useCallback(async (e) => {

    e.preventDefault();

    try {

      setCreating(true);
      setError("");

      const payload = { clinic_id: Number(clinicId), ...manualForm };
      if (!payload.follow_up_date) delete payload.follow_up_date;

      await axios.post(apiUrl("/appointments"), payload);

      setManualForm({
        doctor_id: doctorOptions[0]?.doctor_id || shifts[0]?.doctor_id || "",
        doctor_name: doctorOptions[0]?.doctor_name || shifts[0]?.doctor_name || "",
        appointment_date: "",
        appointment_time: "",
        follow_up_date: "",
        patient_name: "",
        patient_age: "",
        patient_gender: "",
        phone_number: "",
        health_issue: ""
      });

      setManualSlots([]);
      setShowCreateModal(false);
      await fetchAppointments();

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to create appointment");

    } finally {

      setCreating(false);
    }

  }, [clinicId, doctorOptions, fetchAppointments, manualForm, shifts]);

  // ─── Follow-up modal ────────────────────────────────
  const openFollowUpModal = useCallback((appt) => {
    setSelectedForFollowUp(appt);
    setFollowUpDate(appt.follow_up_date || "");
    setShowFollowUpModal(true);
    setOpenMenuId(null);
  }, []);

  const closeFollowUpModal = useCallback(() => {
    setShowFollowUpModal(false);
    setSelectedForFollowUp(null);
    setFollowUpDate("");
  }, []);

  const saveFollowUp = useCallback(async (e) => {

    e.preventDefault();
    if (!selectedForFollowUp || !followUpDate) return;

    try {

      setSavingFollowUp(true);
      setError("");

      await axios.patch(
        apiUrl(`/appointments/${selectedForFollowUp.id}/follow-up`),
        { clinic_id: Number(clinicId), follow_up_date: followUpDate }
      );

      closeFollowUpModal();
      await fetchAppointments();

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to set follow-up date");

    } finally {

      setSavingFollowUp(false);
    }

  }, [clinicId, closeFollowUpModal, fetchAppointments, followUpDate, selectedForFollowUp]);

  // ─── Cancel appointment ──────────────────────────────
  const cancelAppointment = useCallback(async (appt) => {

    setOpenMenuId(null);

    if (!window.confirm(`Cancel appointment for ${appt.patient_name || "this patient"}?`)) return;

    try {

      setCancellingId(appt.id);

      await axios.put(apiUrl(`/appointments/${appt.id}/cancel`), null, {
        params: { clinic_id: clinicId }
      });

      await fetchAppointments();

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to cancel appointment");

    } finally {

      setCancellingId(null);
    }

  }, [clinicId, fetchAppointments]);

  // ─── Mark status ─────────────────────────────────────
  const markStatus = useCallback(async (appt, status) => {

    setOpenMenuId(null);

    try {

      setMarkingId(appt.id);

      await axios.patch(apiUrl(`/appointments/${appt.id}/status`), {
        clinic_id: Number(clinicId),
        status
      });

      await fetchAppointments();

    } catch (e) {

      setError(e.response?.data?.detail || `Failed to mark as ${status}`);

    } finally {

      setMarkingId(null);
    }

  }, [clinicId, fetchAppointments]);

  // ─── Send reminder ────────────────────────────────────
  const sendReminder = useCallback(async (appt) => {

    try {

      setSendingReminderId(appt.id);
      setError("");

      await axios.post(
        apiUrl(`/appointments/${appt.id}/follow-up/remind`),
        null,
        { params: { clinic_id: clinicId } }
      );

      setReminderSentIds((prev) => new Set([...prev, appt.id]));

    } catch (e) {

      setError(e.response?.data?.detail || "Failed to send reminder");

    } finally {

      setSendingReminderId(null);
    }

  }, [clinicId]);

  const headerDoctorName = selectedDoctor?.doctor_name || doctorOptions[0]?.doctor_name || "";

  return (
    <Layout
      title={`Appointments${headerDoctorName ? ` — ${headerDoctorName}` : ""}`}
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
            onClick={() => setShowCreateModal(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Create Appointment
          </button>
          <button
            type="button"
            onClick={fetchAppointments}
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
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 shadow-sm">
          <UserRound size={14} className="text-slate-400" />
          Showing appointments for{" "}
          <span className="font-semibold text-teal-700">{selectedDoctor.doctor_name}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={stats.total} icon={CalendarCheck} />
        <StatCard label="Booked" value={stats.booked} icon={CheckCircle} />
        <StatCard label="Cancelled" value={stats.cancelled} icon={Ban} />
        <StatCard label="No-show" value={stats.noShow} icon={UserRound} />
        <StatCard label="Follow-ups" value={stats.followUps} icon={CalendarClock} />
        <StatCard label="Today" value={stats.today} icon={CalendarDays} />
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-slate-200">
        <div className="flex gap-6">
          {[
            { key: "appointments", label: "Appointment list" },
            { key: "followups", label: "Follow-ups", badge: followUps.length }
          ].map(({ key, label, badge }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative pb-3 text-sm font-semibold transition ${
                activeTab === key
                  ? "text-teal-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-teal-600 after:content-['']"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
              {badge > 0 && (
                <span className="ml-2 rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-bold text-orange-700">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Appointment list ─── */}
      {activeTab === "appointments" && (
        <section className="mt-4">

          {/* Filter bar */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 sm:max-w-72">
              <Search size={15} className="shrink-0 text-slate-400" />
              <input
                type="search"
                placeholder="Search appointments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : s}
                </option>
              ))}
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                <RefreshCw size={13} />
                Clear filters
              </button>
            )}
          </div>

          {/* Grouped sections */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-slate-500">
              <Loader2 className="mr-2 animate-spin text-teal-600" size={18} />
              Loading appointments...
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Today", date: todayStr, list: todayAppts },
                { label: "Tomorrow", date: tomorrowStr, list: tomorrowAppts },
                ...(upcomingAppts.length > 0 ? [{ label: "Upcoming", date: null, list: upcomingAppts }] : [])
              ].map(({ label, date, list }) => (
                <div key={label} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  {/* Group header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{label}</span>
                      {date && (
                        <span className="text-xs text-slate-400">{formatDate(date)}</span>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      {list.length}
                    </span>
                  </div>

                  {list.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400">
                      No appointments {label.toLowerCase()}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-200 text-left text-sm">
                        <thead>
                          <tr>
                            {["Time", "Patient", "Doctor", "Health Issue", "Follow-up", "Status", "Actions"].map((h) => (
                              <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((appt) => {
                            const isCancelled = String(appt.status || "").toLowerCase().includes("cancel");
                            const isActing = cancellingId === appt.id || markingId === appt.id;

                            return (
                              <tr key={appt.id} className="border-t border-slate-100 transition hover:bg-slate-50/60">

                                <td className="whitespace-nowrap px-5 py-3.5">
                                  {label === "Upcoming" && (
                                    <p className="text-xs text-slate-400">{formatDate(appt.appointment_date)}</p>
                                  )}
                                  <p className="font-semibold text-slate-800">{appt.appointment_time || "—"}</p>
                                </td>

                                <td className="px-5 py-3.5">
                                  <p className="font-semibold text-slate-900">{appt.patient_name || "Patient"}</p>
                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {appt.phone_number || ""}
                                    {appt.phone_number && appt.gender ? " · " : ""}
                                    {appt.gender || ""}
                                  </p>
                                </td>

                                <td className="px-5 py-3.5 text-slate-700">{appt.doctor_name || "—"}</td>

                                <td className="max-w-40 px-5 py-3.5 text-slate-600">
                                  <span className="line-clamp-2">
                                    {appt.problem === "WhatsApp booking" ? "—" : appt.problem || "—"}
                                  </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-3.5">
                                  {appt.follow_up_date ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600">
                                      <CalendarDays size={13} />
                                      {formatDate(appt.follow_up_date)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>

                                <td className="px-5 py-3.5">
                                  <StatusBadge status={appt.status} />
                                </td>

                                <td className="px-5 py-3.5">
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        if (openMenuId === appt.id) {
                                          setOpenMenuId(null);
                                        } else {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                          setOpenMenuId(appt.id);
                                        }
                                      }}
                                      disabled={isActing}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                                    >
                                      {isActing ? <Loader2 size={15} className="animate-spin" /> : <MoreVertical size={15} />}
                                    </button>

                                    {openMenuId === appt.id && (
                                      <div className="fixed z-50 min-w-47 rounded-xl border border-slate-200 bg-white py-1 shadow-lg" style={{ top: menuPos.top, right: menuPos.right }}>
                                        <button type="button" onClick={() => openFollowUpModal(appt)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                          <CalendarClock size={14} className="text-slate-400" />
                                          Edit follow-up
                                        </button>
                                        <button type="button" onClick={() => markStatus(appt, "completed")} disabled={isCancelled} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                                          <CheckCircle size={14} className="text-slate-400" />
                                          Mark completed
                                        </button>
                                        <button type="button" onClick={() => markStatus(appt, "no-show")} disabled={isCancelled} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                                          <UserRound size={14} className="text-slate-400" />
                                          Mark as no-show
                                        </button>
                                        <div className="my-1 border-t border-slate-100" />
                                        <button type="button" onClick={() => cancelAppointment(appt)} disabled={isCancelled} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
                                          <Ban size={14} />
                                          Cancel appointment
                                        </button>
                                      </div>
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
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─── Follow-ups tab ─── */}
      {activeTab === "followups" && (
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <CalendarClock size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">Tomorrow's follow-ups</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Patients with a follow-up scheduled for tomorrow. Send a WhatsApp reminder once to book.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              <Loader2 className="mr-2 animate-spin text-teal-600" size={18} />
              Loading...
            </div>
          ) : followUps.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CalendarClock size={22} />
              </div>
              <p className="text-sm font-medium text-slate-700">No follow-ups due tomorrow.</p>
              <p className="mt-1 text-sm text-slate-500">
                Patients with a follow-up date set for tomorrow will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Patient", "Doctor", "Original visit", "Follow-up date", "Due in", "Action"].map((h) => (
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
                  {followUps.map((appt) => (
                    <tr
                      key={appt.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {appt.patient_name || "Patient"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {appt.phone_number || "No phone"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {appt.doctor_name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700">
                          {formatDate(appt.appointment_date)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {appt.appointment_time || ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {formatDate(appt.follow_up_date)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          appt.days_until_follow_up < 0
                            ? "bg-red-50 text-red-700"
                            : appt.days_until_follow_up <= 1
                            ? "bg-orange-50 text-orange-700"
                            : "bg-teal-50 text-teal-700"
                        }`}>
                          {appt.days_until_follow_up < 0
                            ? `${Math.abs(appt.days_until_follow_up)}d overdue`
                            : appt.days_until_follow_up === 0
                            ? "Today"
                            : appt.days_until_follow_up === 1
                            ? "Tomorrow"
                            : `In ${appt.days_until_follow_up} days`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {reminderSentIds.has(appt.id) ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                              <CheckCircle size={13} />
                              Reminder sent
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => sendReminder(appt)}
                              disabled={sendingReminderId === appt.id || !appt.phone_number}
                              title={!appt.phone_number ? "No phone number on record" : "Send WhatsApp reminder"}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {sendingReminderId === appt.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Bell size={13} />
                              )}
                              Send reminder
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openFollowUpModal(appt)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                          >
                            <CalendarClock size={13} />
                            Edit date
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ─── Create Appointment Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Create Appointment</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Book a physical visit using available doctor slots.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-6">
              <form onSubmit={createManualAppointment} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Doctor">
                    <select
                      value={manualForm.doctor_id || manualForm.doctor_name}
                      onChange={(e) => updateManualForm("doctor_id", e.target.value)}
                      disabled={doctorOptions.length <= 1}
                      className={inputCls}
                      required
                    >
                      {doctorOptions.length === 0 && (
                        <option value="">No doctors configured</option>
                      )}
                      {doctorOptions.map((d) => (
                        <option key={d.id} value={d.id}>{d.doctor_name}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Date">
                    <input
                      type="date"
                      value={manualForm.appointment_date}
                      onChange={(e) => updateManualForm("appointment_date", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label="Patient name">
                    <input
                      type="text"
                      placeholder="Patient name"
                      value={manualForm.patient_name}
                      onChange={(e) => updateManualForm("patient_name", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={manualForm.phone_number}
                      onChange={(e) => updateManualForm("phone_number", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label="Age">
                    <input
                      type="text"
                      placeholder="Age"
                      value={manualForm.patient_age}
                      onChange={(e) => updateManualForm("patient_age", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Gender">
                    <select
                      value={manualForm.patient_gender}
                      onChange={(e) => updateManualForm("patient_gender", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>

                  <Field label="Health issue">
                    <input
                      type="text"
                      placeholder="Health issue"
                      value={manualForm.health_issue}
                      onChange={(e) => updateManualForm("health_issue", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label="Follow-up date (optional)">
                    <input
                      type="date"
                      value={manualForm.follow_up_date}
                      min={todayStr}
                      onChange={(e) => updateManualForm("follow_up_date", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Slots */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Available slots
                    </span>
                    <button
                      type="button"
                      onClick={loadManualSlots}
                      disabled={slotLoading || !manualForm.doctor_name || !manualForm.appointment_date}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 disabled:opacity-50"
                    >
                      {slotLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <RefreshCw size={12} />
                      )}
                      Find slots
                    </button>
                  </div>
                  <div className="min-h-16 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {slotLoading ? (
                      <div className="flex min-h-12 items-center justify-center text-sm text-slate-400">
                        <Loader2 size={15} className="mr-2 animate-spin text-teal-600" />
                        Checking availability…
                      </div>
                    ) : manualSlots.length === 0 ? (
                      <p className="flex min-h-12 items-center justify-center text-sm text-slate-400">
                        Choose a doctor and date, then click Find slots.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {manualSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => updateManualForm("appointment_time", slot)}
                            className={`min-h-9 rounded-lg border px-3 text-sm font-semibold transition ${
                              manualForm.appointment_time === slot
                                ? "border-teal-700 bg-teal-700 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !manualForm.appointment_time}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Plus size={15} />
                    )}
                    Book visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Follow-up modal ─── */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/30"
            onClick={closeFollowUpModal}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Set follow-up date</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Patient will be notified via WhatsApp to book before this date.
                </p>
              </div>
              <button
                type="button"
                onClick={closeFollowUpModal}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  {selectedForFollowUp?.patient_name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedForFollowUp?.doctor_name}
                  {" · "}
                  #{selectedForFollowUp?.appointment_no || selectedForFollowUp?.id}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(selectedForFollowUp?.appointment_date)}
                  {selectedForFollowUp?.appointment_time
                    ? ` · ${selectedForFollowUp.appointment_time}`
                    : ""}
                </p>
                {selectedForFollowUp?.phone_number && (
                  <p className="mt-2 text-xs font-medium text-teal-700">
                    WhatsApp → {selectedForFollowUp.phone_number}
                  </p>
                )}
              </div>

              <form onSubmit={saveFollowUp} className="mt-5 space-y-5">
                <Field label="Follow-up date">
                  <input
                    type="date"
                    value={followUpDate}
                    min={todayStr}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className={inputCls}
                    required
                    autoFocus
                  />
                </Field>

                {followUpDate && (
                  <p className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-800">
                    A WhatsApp message will be sent asking{" "}
                    <strong>{selectedForFollowUp?.patient_name}</strong> to book
                    before{" "}
                    <strong>{formatDate(followUpDate)}</strong>.
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeFollowUpModal}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFollowUp || !followUpDate}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingFollowUp ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CalendarClock size={15} />
                    )}
                    Save &amp; notify
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close three-dot menu on outside click */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}

    </Layout>
  );
}
