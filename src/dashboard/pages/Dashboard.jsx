import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Link } from "react-router-dom";

import axios from "axios";

import {
  Calendar,
  CalendarCheck,
  ChevronRight,
  Clock,
  ClipboardList,
  Loader2,
  Moon,
  Plus,
  Search,
  Stethoscope,
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

  // Recent patients (last 4 by created_at)
  const recentPatients = useMemo(() =>
    [...patients]
      .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
      .slice(0, 4),
    [patients]
  );

  // Reminders
  const followUpCount = appointments.filter(
    (a) => a.follow_up_date && a.follow_up_date >= todayIso()
  ).length;

  const noShowToday = todayAppointments.filter((a) => a.status === "no-show").length;

  // Chart stat totals (all appointments in loaded data, not filtered by doctor for overview)
  const chartTotal = allAppointments.filter((a) => a.status !== "cancelled").length;
  const chartCompleted = allAppointments.filter((a) => a.status === "completed").length;
  const chartCancelled = allAppointments.filter((a) => a.status === "cancelled").length;
  const chartNoShow = allAppointments.filter((a) => a.status === "no-show").length;

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

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Today's Appointments"
          value={todayAppointments.length}
          helper={`${waitingCount} waiting • ${confirmedCount} confirmed`}
          helperColor="text-teal-700"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={upcomingAppointments.length}
          helper={nextUpcoming ? `Next: ${nextUpcoming.appointment_time}` : "No upcoming"}
          helperColor="text-violet-700"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={Users}
          label="New Patients"
          value={newPatientsThisWeek}
          helper="This week"
          helperColor="text-blue-700"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={ClipboardList}
          label="Physical Visits"
          value={physicalVisits}
          helper="Walk-in records"
          helperColor="text-orange-600"
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_1fr]">

        {/* Left: Today's Appointments */}
        <Card title="Today's Appointments" linkTo="/appointments">
          {todayAppointments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
              {todayAppointments.slice(0, 5).map((appt) => {
                const { label, cls } = statusLabel(appt.status);
                return (
                  <div
                    key={appt.id}
                    className="grid items-center gap-3 px-4 py-3"
                    style={{ gridTemplateColumns: "76px auto 1fr auto" }}
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      {appt.appointment_time}
                    </p>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(appt.patient_name)}`}>
                      {initials(appt.patient_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">
                        {appt.patient_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {appt.problem || appt.health_issue || "Consultation"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right: Appointments Overview + Reminders */}
        <div className="flex flex-col gap-4">

          {/* Appointments Overview chart */}
          <Card title="Appointments Overview">
            <WeekChart appointments={allAppointments} />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                ["Total", chartTotal, "bg-teal-500"],
                ["Completed", chartCompleted, "bg-green-500"],
                ["Cancelled", chartCancelled, "bg-red-500"],
                ["No-show", chartNoShow, "bg-amber-500"]
              ].map(([label, val, dot]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-950">{val}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Reminders & Actions */}
          <Card title="Reminders & Actions">
            <div className="space-y-2">
              {[
                {
                  icon: Calendar,
                  label: `${followUpCount} upcoming follow-up${followUpCount !== 1 ? "s" : ""}`,
                  to: "/appointments",
                  color: "text-teal-600",
                  bg: "bg-teal-50"
                },
                {
                  icon: UserRound,
                  label: `${noShowToday} patient${noShowToday !== 1 ? "s" : ""} marked no-show`,
                  to: "/appointments",
                  color: "text-red-600",
                  bg: "bg-red-50"
                },
                {
                  icon: Stethoscope,
                  label: "Update clinic profile",
                  to: "/profile",
                  color: "text-violet-600",
                  bg: "bg-violet-50"
                },
                {
                  icon: Users,
                  label: `${doctors.length} active doctor${doctors.length !== 1 ? "s" : ""}`,
                  to: "/doctors",
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                }
              ].map(({ icon: Icon, label, to, color, bg }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                      <Icon size={15} className={color} />
                    </div>
                    {label}
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>



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
