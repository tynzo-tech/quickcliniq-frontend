import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Link } from "react-router-dom";

import axios from "axios";

import {
  Ban,
  Calendar,
  CalendarCheck,
  CheckCircle,
  Clock,
  Loader2,
  Moon,
  Plus,
  Search,
  Sun,
  Sunset,
  UserRound,
  Users,
  X
} from "lucide-react";

import Layout from "../../components/Layout";

import { apiUrl } from "../../config/api";


// ─── helpers ──────────────────────────────────────────

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function mondayIso() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(d);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return ["Good morning", Sun];
  if (h < 17) return ["Good afternoon", Sunset];
  return ["Good evening", Moon];
}

function initials(name) {
  return String(name || "P")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return { label: "Completed", cls: "bg-teal-50 text-teal-700" };
  if (s === "no-show") return { label: "No-show", cls: "bg-red-50 text-red-700" };
  if (s === "cancelled") return { label: "Cancelled", cls: "bg-red-50 text-red-700" };
  return { label: "Waiting", cls: "bg-amber-50 text-amber-700" };
}

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700"
];
function avatarColor(name) {
  let n = 0;
  for (const c of String(name || "")) n += c.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function todayIsoNow() {
  return new Date().toTimeString().slice(0, 5);
}

// ─── sub-components ───────────────────────────────────

function StatCard({ icon: Icon, label, value, helper, helperColor, iconBg, iconColor }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {helper && (
            <p className={`mt-1 text-xs font-medium ${helperColor || "text-slate-500"}`}>
              {helper}
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, linkTo, linkLabel = "View all", children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── chart ────────────────────────────────────────────

function WeekChart({ appointments }) {

  const W = 460;
  const H = 140;
  const PAD = { top: 12, right: 12, bottom: 30, left: 20 };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weekData = useMemo(() => {
    const monday = mondayIso();
    return days.map((label, i) => {
      const d = new Date(`${monday}T00:00:00`);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const dayAppts = appointments.filter((a) => a.appointment_date === iso);
      return {
        label,
        total: dayAppts.filter((a) => a.status !== "cancelled").length
      };
    });
  }, [appointments]);

  const max = Math.max(1, ...weekData.map((d) => d.total));
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const step = chartW / (days.length - 1);

  const pts = weekData.map((d, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + chartH - (d.total / max) * chartH,
    ...d
  }));

  const yTicks = [0, Math.round(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Weekly appointments chart"
    >
      {/* grid lines */}
      {yTicks.map((tick) => {
        const y = PAD.top + chartH - (tick / max) * chartH;
        return (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 4}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#94a3b8"
              fontSize="9"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* line */}
      <polyline
        fill="none"
        stroke="#0d9488"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
      />

      {/* dots + labels */}
      {pts.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#0d9488" />
          <circle cx={p.x} cy={p.y} r="2.5" fill="white" />
          <text
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            fill="#64748b"
            fontSize="10"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}


// ─── main component ───────────────────────────────────

export default function Dashboard() {

  const clinicId = localStorage.getItem("clinic_id");

  const storedClinic = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("clinic")); }
    catch { return null; }
  }, []);

  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form, setForm] = useState({
    doctor_id: "",
    doctor_name: "",
    appointment_date: todayIso(),
    appointment_time: "",
    patient_name: "",
    patient_age: "",
    patient_gender: "",
    phone_number: "",
    health_issue: ""
  });


  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [dashRes, patRes, docRes] = await Promise.all([
        axios.get(apiUrl(`/dashboard/${clinicId}`)),
        axios.get(apiUrl("/patients"), { params: { clinic_id: clinicId } }),
        axios.get(apiUrl("/doctors"), { params: { clinic_id: clinicId } })
      ]);

      setDashboard(dashRes.data);
      setPatients(Array.isArray(patRes.data) ? patRes.data : []);

      const activeDocs = Array.isArray(docRes.data)
        ? docRes.data.filter((d) => d.is_active !== false)
        : [];

      setDoctors(activeDocs);

      setSelectedDoctorId((cur) => {
        const has = activeDocs.some((d) => String(d.id) === String(cur));
        return has ? cur : (activeDocs[0]?.id ? String(activeDocs[0].id) : "");
      });

      setForm((cur) => {
        const curDoc = activeDocs.find((d) => String(d.id) === String(cur.doctor_id));
        const fallback = curDoc || activeDocs[0];
        return {
          ...cur,
          doctor_id: fallback?.id || "",
          doctor_name: fallback?.doctor_name || fallback?.name || ""
        };
      });

    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [clinicId]);


  useEffect(() => {
    const t = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(t);
  }, [loadDashboard]);


  // ─── derived data ─────────────────────────────────

  const allAppointments = dashboard?.appointments || [];

  const selectedDoctor = doctors.find(
    (d) => String(d.id) === String(selectedDoctorId)
  ) || null;
  const selectedDoctorName = selectedDoctor?.doctor_name || selectedDoctor?.name || "";

  const appointments = useMemo(() => {
    if (!selectedDoctorId) return allAppointments;
    return allAppointments.filter((a) =>
      String(a.doctor_id || "") === String(selectedDoctorId) ||
      (!a.doctor_id && selectedDoctorName && a.doctor_name === selectedDoctorName)
    );
  }, [allAppointments, selectedDoctorId, selectedDoctorName]);

  const todayAppointments = useMemo(() =>
    appointments
      .filter((a) => a.appointment_date === todayIso() && a.status !== "cancelled")
      .sort((a, b) =>
        String(a.appointment_time || "").localeCompare(String(b.appointment_time || ""))
      ),
    [appointments]
  );

  const upcomingAppointments = useMemo(() =>
    appointments.filter((a) => a.appointment_date >= todayIso() && a.status !== "cancelled"),
    [appointments]
  );

  // Next upcoming appointment time today (after now)
  const nowTime = todayIsoNow();
  const nextUpcoming = todayAppointments.find(
    (a) => String(a.appointment_time || "") > nowTime && a.status === "booked"
  );

  // Stat helpers
  const waitingCount = todayAppointments.filter((a) => a.status === "booked").length;
  const confirmedCount = todayAppointments.filter((a) => a.status === "completed").length;

  const monday = mondayIso();
  const newPatientsThisWeek = patients.filter(
    (p) => String(p.created_at || "").slice(0, 10) >= monday
  ).length;

  const physicalVisits = todayAppointments.filter(
    (a) => a.created_by === "Dashboard"
  ).length;

  const noShowToday = todayAppointments.filter((a) => a.status === "no-show").length;

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const tomorrowAppointments = useMemo(() =>
    appointments
      .filter((a) => a.appointment_date === tomorrowStr && a.status !== "cancelled")
      .sort((a, b) => String(a.appointment_time || "").localeCompare(String(b.appointment_time || ""))),
    [appointments, tomorrowStr]
  );

  const [greetText, GreetIcon] = greeting();
  const doctorDisplayName =
    selectedDoctorName || storedClinic?.doctor_name || dashboard?.clinic?.doctor_name || "Doctor";


  // ─── form helpers ─────────────────────────────────

  const updateForm = (field, value) => {
    setForm((cur) => ({
      ...cur,
      [field]: value,
      ...(field === "doctor_id" ? {
        doctor_name: doctors.find((d) => String(d.id) === value)?.doctor_name ||
          doctors.find((d) => String(d.id) === value)?.name || ""
      } : {}),
      ...(field === "doctor_id" || field === "appointment_date" ? { appointment_time: "" } : {})
    }));
    if (field === "doctor_id" || field === "appointment_date") setAvailableSlots([]);
  };

  const loadSlots = async () => {
    if (!form.doctor_id || !form.appointment_date) return;
    try {
      setSlotLoading(true);
      const res = await axios.get(apiUrl("/available-slots"), {
        params: {
          clinic_id: clinicId,
          doctor_id: form.doctor_id,
          appointment_date: form.appointment_date
        }
      });
      setAvailableSlots(res.data?.slots || []);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load slots");
    } finally {
      setSlotLoading(false);
    }
  };

  const createAppointment = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await axios.post(apiUrl("/appointments"), {
        clinic_id: Number(clinicId),
        ...form
      });
      setShowCreate(false);
      setAvailableSlots([]);
      setForm((cur) => ({
        ...cur,
        appointment_time: "",
        patient_name: "",
        patient_age: "",
        patient_gender: "",
        phone_number: "",
        health_issue: ""
      }));
      await loadDashboard();
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to create appointment");
    } finally {
      setCreating(false);
    }
  };


  const [markingId, setMarkingId] = useState(null);

  const markStatus = useCallback(async (apptId, newStatus) => {
    try {
      setMarkingId(apptId);
      await axios.patch(apiUrl(`/appointments/${apptId}/status`), null, {
        params: { clinic_id: clinicId, status: newStatus }
      });
      await loadDashboard();
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to update status");
    } finally {
      setMarkingId(null);
    }
  }, [clinicId, loadDashboard]);

  // ─── render ───────────────────────────────────────

  if (loading) {
    return (
      <Layout
        title="Dashboard"
        subtitle="Here's what's happening at your clinic today."
      >
        <div className="py-20 text-center">
          <Loader2 size={24} className="mx-auto mb-3 animate-spin text-teal-600" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }


  return (
    <Layout
      title={(
        <span className="flex items-center gap-2.5">
          <GreetIcon size={22} className="text-amber-500" />
          {greetText}, {doctorDisplayName}
        </span>
      )}
      subtitle="Here's what's happening at your clinic today."
      actions={(
        <div className="flex flex-wrap items-center gap-2">
          {/* Doctor selector */}
          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <UserRound size={15} className="text-slate-400" />
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                updateForm("doctor_id", e.target.value);
              }}
              disabled={doctors.length <= 1}
              className="bg-transparent text-sm font-semibold outline-none disabled:cursor-default disabled:text-slate-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.doctor_name || d.name}
                </option>
              ))}
            </select>
          </label>

          {/* Create appointment */}
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Create Appointment
          </button>

          {/* Date chip */}
          <div className="hidden min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 sm:flex">
            <Calendar size={14} className="text-slate-400" />
            {formatDate(todayIso())}
          </div>
        </div>
      )}
    >

      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── 4 stat cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Today" value={todayAppointments.length}
          helper="Scheduled" helperColor="text-slate-500" iconBg="bg-teal-50" iconColor="text-teal-600" />
        <StatCard icon={Clock} label="Waiting" value={waitingCount}
          helper="Yet to be seen" helperColor="text-amber-600" iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard icon={CheckCircle} label="Completed" value={confirmedCount}
          helper="Done today" helperColor="text-green-600" iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard icon={Ban} label="No-show" value={noShowToday}
          helper="Didn't arrive" helperColor="text-red-500" iconBg="bg-red-50" iconColor="text-red-500" />
      </div>

      {/* ── Today's appointments (full list) ── */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-slate-950">Today's Appointments</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {todayAppointments.length}
            </span>
          </div>
          <Link to="/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            View all →
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck size={28} className="mx-auto mb-3 text-slate-200" />
            <p className="text-sm text-slate-400">No appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppointments.map((appt) => {
              const isBooked = String(appt.status || "").toLowerCase().includes("book");
              const isCompleted = appt.status === "completed";
              const isNoShow = appt.status === "no-show";
              const isMarking = markingId === appt.id;

              return (
                <div key={appt.id} className="flex items-center gap-3 px-5 py-3">
                  {/* Time */}
                  <div className="w-18 shrink-0 text-sm font-bold text-slate-800">
                    {appt.appointment_time || "—"}
                  </div>

                  {/* Avatar */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(appt.patient_name)}`}>
                    {initials(appt.patient_name)}
                  </div>

                  {/* Patient info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {appt.patient_name || "Patient"}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {appt.problem && appt.problem !== "WhatsApp booking" ? appt.problem : "Consultation"}
                      {appt.patient_age ? ` · ${appt.patient_age}y` : ""}
                      {appt.gender ? ` · ${appt.gender}` : ""}
                    </p>
                  </div>

                  {/* Doctor */}
                  <p className="hidden shrink-0 text-xs text-slate-500 sm:block">
                    {appt.doctor_name || ""}
                  </p>

                  {/* Actions / status */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isMarking ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : isBooked ? (
                      <>
                        <button
                          type="button"
                          onClick={() => markStatus(appt.id, "completed")}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white transition hover:bg-teal-700"
                        >
                          <CheckCircle size={12} />
                          Done
                        </button>
                        <button
                          type="button"
                          onClick={() => markStatus(appt.id, "no-show")}
                          className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          No-show
                        </button>
                      </>
                    ) : isCompleted ? (
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        Completed
                      </span>
                    ) : isNoShow ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        No-show
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Tomorrow preview ── */}
      {tomorrowAppointments.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-slate-950">Tomorrow</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {tomorrowAppointments.length}
              </span>
              <span className="text-xs text-slate-400">{formatDate(tomorrowStr)}</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {tomorrowAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-18 shrink-0 text-sm font-semibold text-slate-600">
                  {appt.appointment_time || "—"}
                </div>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(appt.patient_name)}`}>
                  {initials(appt.patient_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{appt.patient_name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {appt.problem && appt.problem !== "WhatsApp booking" ? appt.problem : "Consultation"}
                  </p>
                </div>
                <p className="hidden shrink-0 text-xs text-slate-400 sm:block">{appt.doctor_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* ── Create Appointment drawer ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30">
          <form
            onSubmit={createAppointment}
            className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            {/* Sticky header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Create Appointment</h2>
                <span className="mt-1 inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">Walk-in</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6">

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Doctor</span>
                <select
                  value={form.doctor_id}
                  onChange={(e) => updateForm("doctor_id", e.target.value)}
                  disabled={doctors.length <= 1}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.doctor_name || d.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Date</span>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) => updateForm("appointment_date", e.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                />
              </label>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Available Slots
                </span>
                <button
                  type="button"
                  onClick={loadSlots}
                  disabled={slotLoading || !form.doctor_id || !form.appointment_date}
                  className="text-sm font-semibold text-teal-700 disabled:opacity-50"
                >
                  {slotLoading ? "Loading..." : "Find slots"}
                </button>
              </div>
              <div className="min-h-28 rounded-lg border border-slate-200 p-3">
                {availableSlots.length === 0 ? (
                  <div className="flex min-h-20 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
                    <Search size={18} className="text-slate-300" />
                    Select doctor and date then click Find slots
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => updateForm("appointment_time", slot)}
                        className={`min-h-9 rounded-lg border px-3 text-sm font-semibold transition ${
                          form.appointment_time === slot
                            ? "border-teal-700 bg-teal-700 text-white"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-950">
                Patient Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["patient_name", "Patient name", "text", true],
                  ["phone_number", "Phone", "tel", true],
                  ["patient_age", "Age", "number", false]
                ].map(([field, label, type, req]) => (
                  <label key={field} className="block">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => updateForm(field, e.target.value)}
                      className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      required={req}
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Gender</span>
                  <select
                    value={form.patient_gender}
                    onChange={(e) => updateForm("patient_gender", e.target.value)}
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-700">
                  Health issue
                  <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
                </span>
                <input
                  type="text"
                  value={form.health_issue}
                  onChange={(e) => updateForm("health_issue", e.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !form.appointment_time}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                {creating && <Loader2 size={15} className="animate-spin" />}
                Book Visit
              </button>
            </div>
            </div>{/* end scrollable body */}
          </form>
        </div>
      )}

    </Layout>
  );
}
