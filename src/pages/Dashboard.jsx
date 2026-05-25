import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  Bell,
  Calendar,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  Plus,
  Search,
  UserRound,
  Users,
  X
} from "lucide-react";

import Layout from "../components/Layout";

import {
  apiUrl
} from "../config/api";


function todayIso() {

  return new Date()
    .toISOString()
    .slice(0, 10);
}


function formatDate(value) {

  if (!value) {

    return "-";
  }

  const date =
    new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {

    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(date);
}


function greeting() {

  const hour =
    new Date().getHours();

  if (hour < 12) {

    return "Good morning";
  }

  if (hour < 17) {

    return "Good afternoon";
  }

  return "Good evening";
}


function initials(name) {

  return String(name || "Patient")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}


function statusClass(status) {

  const normalized =
    String(status || "").toLowerCase();

  if (normalized.includes("cancel")) {

    return "bg-red-50 text-red-700";
  }

  if (normalized.includes("upcoming")) {

    return "bg-blue-50 text-blue-700";
  }

  return "bg-teal-50 text-teal-700";
}


function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  tone
}) {

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
          <Icon size={27} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          {helper && (
            <p className="mt-2 text-sm font-medium text-teal-700">
              {helper}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


function DashboardSection({
  title,
  action,
  children
}) {

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}


export default function Dashboard() {

  const clinicId =
    localStorage.getItem(
      "clinic_id"
    );

  const storedClinic =
    useMemo(() => {

      try {

        return JSON.parse(
          localStorage.getItem("clinic")
        );

      } catch {

        return null;
      }
    }, []);

  const [dashboard, setDashboard] =
    useState(null);

  const [patients, setPatients] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [slotLoading, setSlotLoading] =
    useState(false);

  const [availableSlots, setAvailableSlots] =
    useState([]);

  const [form, setForm] =
    useState({
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


  const loadDashboard =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");

        const [
          dashboardResponse,
          patientsResponse,
          doctorsResponse
        ] = await Promise.all([
          axios.get(
            apiUrl(`/dashboard/${clinicId}`)
          ),
          axios.get(
            apiUrl("/patients"),
            {
              params: {
                clinic_id: clinicId
              }
            }
          ),
          axios.get(
            apiUrl("/doctors"),
            {
              params: {
                clinic_id: clinicId
              }
            }
          )
        ]);

        setDashboard(
          dashboardResponse.data
        );
        setPatients(
          Array.isArray(patientsResponse.data)
            ? patientsResponse.data
            : []
        );

        const activeDoctors =
          Array.isArray(doctorsResponse.data)
            ? doctorsResponse.data.filter((doctor) => doctor.is_active !== false)
            : [];

        setDoctors(
          activeDoctors
        );

        setForm((current) => ({
          ...current,
          doctor_id: current.doctor_id || activeDoctors[0]?.id || "",
          doctor_name:
            current.doctor_name
            || activeDoctors[0]?.doctor_name
            || activeDoctors[0]?.name
            || ""
        }));

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to load dashboard"
        );

      } finally {

        setLoading(false);
      }
    }, [clinicId]);


  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        loadDashboard();

      }, 0);

    return () =>
      window.clearTimeout(timer);

  }, [loadDashboard]);


  const appointments =
    useMemo(() =>
      dashboard?.appointments || [],
    [dashboard]
    );

  const todayAppointments =
    useMemo(() =>
      appointments
        .filter((appointment) =>
          appointment.appointment_date === todayIso()
          && appointment.status !== "cancelled"
        )
        .sort((a, b) =>
          String(a.appointment_time || "").localeCompare(
            String(b.appointment_time || "")
          )
        ),
    [appointments]
    );

  const upcomingAppointments =
    useMemo(() =>
      appointments.filter((appointment) =>
        appointment.appointment_date >= todayIso()
        && appointment.status !== "cancelled"
      ),
    [appointments]
    );

  const newPatientsToday =
    patients.filter((patient) =>
      String(patient.created_at || "").startsWith(todayIso())
    ).length;

  const recentPatients =
    [...patients]
      .reverse()
      .slice(0, 4);

  const chartData =
    useMemo(() => {

      const labels = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ];

      const counts =
        labels.map((_, index) =>
          appointments.filter((appointment) => {
            const date =
              new Date(`${appointment.appointment_date}T00:00:00`);

            return !Number.isNaN(date.getTime())
              && (date.getDay() + 6) % 7 === index;
          }).length
        );

      const max =
        Math.max(
          1,
          ...counts
        );

      return labels.map((label, index) => ({
        label,
        count: counts[index],
        x: 20 + index * 48,
        y: 150 - (counts[index] / max) * 110
      }));
    }, [appointments]);

  const updateForm =
    (field, value) => {

      setForm((current) => ({
        ...current,
        [field]: value,
        ...(field === "doctor_id"
          ? {
              doctor_name:
                doctors.find((doctor) => String(doctor.id) === value)
                  ?.doctor_name
                || doctors.find((doctor) => String(doctor.id) === value)
                  ?.name
                || ""
            }
          : {}),
        ...(field === "doctor_id" || field === "appointment_date"
          ? {
              appointment_time: ""
            }
          : {})
      }));

      if (field === "doctor_id" || field === "appointment_date") {

        setAvailableSlots([]);
      }
    };


  const loadSlots =
    async () => {

      if (!form.doctor_id || !form.appointment_date) {

        setError(
          "Select doctor and date first."
        );

        return;
      }

      try {

        setSlotLoading(true);
        setError("");

        const response =
          await axios.get(
            apiUrl("/available-slots"),
            {
              params: {
                clinic_id: clinicId,
                doctor_id: form.doctor_id,
                appointment_date: form.appointment_date
              }
            }
          );

        setAvailableSlots(
          response.data?.slots || []
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to load slots"
        );

      } finally {

        setSlotLoading(false);
      }
    };


  const createAppointment =
    async (event) => {

      event.preventDefault();

      try {

        setCreating(true);
        setError("");

        await axios.post(
          apiUrl("/appointments"),
          {
            clinic_id: Number(clinicId),
            ...form
          }
        );

        setShowCreate(false);
        setAvailableSlots([]);
        setForm((current) => ({
          ...current,
          appointment_time: "",
          patient_name: "",
          patient_age: "",
          patient_gender: "",
          phone_number: "",
          health_issue: ""
        }));

        await loadDashboard();

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to create appointment"
        );

      } finally {

        setCreating(false);
      }
    };


  if (loading) {

    return (
      <Layout>
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
          Loading dashboard...
        </div>
      </Layout>
    );
  }


  return (
    <Layout
      title={`${greeting()}, ${storedClinic?.doctor_name || dashboard?.clinic?.doctor_name || "Doctor"}`}
      subtitle="Here's what's happening at your clinic today."
      actions={(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Plus size={17} />
            Create Appointment
          </button>
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
              {upcomingAppointments.length}
            </span>
          </button>
          <div className="hidden min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 sm:inline-flex">
            <Calendar size={17} />
            {formatDate(todayIso())}
          </div>
        </div>
      )}
    >
      {error && (
        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Today's Appointments"
          value={todayAppointments.length}
          helper="Live schedule"
          tone="bg-teal-50 text-teal-700"
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={upcomingAppointments.length}
          helper={todayAppointments[0]?.appointment_time ? `Next: ${todayAppointments[0].appointment_time}` : "No visit queued"}
          tone="bg-violet-50 text-violet-700"
        />
        <StatCard
          icon={Users}
          label="New Patients"
          value={newPatientsToday}
          helper={`${patients.length} total patients`}
          tone="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={ClipboardList}
          label="Today's Records"
          value={todayAppointments.filter((item) => item.created_by === "Dashboard").length}
          helper="Physical visits"
          tone="bg-orange-50 text-orange-700"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_1fr]">
        <DashboardSection
          title="Today's Appointments"
          action={(
            <a
              href="/appointments"
              className="text-sm font-semibold text-blue-700"
            >
              View all
            </a>
          )}
        >
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {todayAppointments.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No appointments today.
              </div>
            ) : todayAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className="grid grid-cols-[82px_1fr_auto] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
              >
                <p className="text-sm font-bold text-slate-950">
                  {appointment.appointment_time}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {initials(appointment.patient_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {appointment.patient_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {appointment.problem || appointment.health_issue || "Consultation"}
                    </p>
                  </div>
                </div>
                <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusClass(appointment.status)}`}>
                  {appointment.status || "Confirmed"}
                </span>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Appointments Overview">
          <svg
            viewBox="0 0 340 170"
            className="h-56 w-full"
            role="img"
            aria-label="Appointments overview chart"
          >
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              points={chartData.map((point) => `${point.x},${point.y}`).join(" ")}
            />
            {chartData.map((point) => (
              <g key={point.label}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#059669"
                />
                <text
                  x={point.x}
                  y="165"
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
          <div className="grid grid-cols-4 gap-3">
            {[
              ["Total", appointments.length, "bg-slate-400"],
              ["Completed", appointments.filter((item) => item.status !== "cancelled").length, "bg-teal-500"],
              ["Cancelled", appointments.filter((item) => item.status === "cancelled").length, "bg-red-500"],
              ["No Show", 0, "bg-amber-500"]
            ].map(([label, value, dot]) => (
              <div
                key={label}
                className="rounded-lg border border-slate-200 p-3"
              >
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardSection
          title="Recent Patients"
          action={<a href="/patients" className="text-sm font-semibold text-blue-700">View all</a>}
        >
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                    {initials(patient.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {patient.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {patient.phone_number || "-"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  {formatDate(String(patient.created_at || "").slice(0, 10))}
                </p>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Book Physical Visit Record"
          action={<a href="/appointments" className="text-sm font-semibold text-blue-700">View all</a>}
        >
          <div className="space-y-3">
            {todayAppointments.slice(0, 4).map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {appointment.patient_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {appointment.problem || "Consultation"}
                  </p>
                </div>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  {formatDate(appointment.appointment_date)}, {appointment.appointment_time}
                  <ChevronRight size={15} />
                </p>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Reminders">
          <div className="space-y-3">
            {[
              [`${upcomingAppointments.length} upcoming appointments`, "/appointments", Calendar],
              ["Update your clinic profile", "/profile", UserRound],
              [`${doctors.length} active doctors`, "/doctors", Users]
            ].map(([label, path, Icon]) => (
              <a
                key={label}
                href={path}
                className="flex min-h-14 items-center justify-between rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className="text-teal-700" />
                  {label}
                </span>
                <ChevronRight size={16} />
              </a>
            ))}
          </div>
        </DashboardSection>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 px-4 py-6">
          <form
            onSubmit={createAppointment}
            className="h-full w-full max-w-xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">
                Create Appointment
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 inline-flex rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
              Walk-in
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Doctor
                </span>
                <select
                  value={form.doctor_id}
                  onChange={(event) => updateForm("doctor_id", event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.doctor_name || doctor.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Date
                </span>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(event) => updateForm("appointment_date", event.target.value)}
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
                  disabled={slotLoading}
                  className="text-sm font-semibold text-teal-700 disabled:opacity-60"
                >
                  {slotLoading ? "Loading" : "Find slots"}
                </button>
              </div>
              <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search size={16} className="text-slate-400" />
                <span className="text-sm text-slate-400">
                  Select a slot below
                </span>
              </label>
              <div className="mt-3 min-h-28 rounded-lg border border-slate-200 p-3">
                {availableSlots.length === 0 ? (
                  <div className="flex min-h-20 flex-col items-center justify-center text-center text-sm text-slate-500">
                    <Calendar className="mb-2 text-slate-400" />
                    Select doctor and date to view available slots
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => updateForm("appointment_time", slot)}
                        className={`min-h-9 rounded-lg border px-3 text-sm font-semibold ${
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
              <h3 className="text-sm font-semibold text-slate-950">
                Patient Details
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {[
                  ["patient_name", "Patient Name", "text"],
                  ["phone_number", "Phone", "tel"],
                  ["patient_age", "Age", "number"]
                ].map(([field, label, type]) => (
                  <label key={field} className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      {label}
                    </span>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(event) => updateForm(field, event.target.value)}
                      className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      required={field !== "patient_age"}
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Gender
                  </span>
                  <select
                    value={form.patient_gender}
                    onChange={(event) => updateForm("patient_gender", event.target.value)}
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
                  Health Issue Optional
                </span>
                <input
                  type="text"
                  value={form.health_issue}
                  onChange={(event) => updateForm("health_issue", event.target.value)}
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
                {creating && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Book Visit
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
