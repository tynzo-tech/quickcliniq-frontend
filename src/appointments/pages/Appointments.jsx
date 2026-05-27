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
  CheckCircle,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  UserPlus,
  X
} from "lucide-react";

import Layout
from "../../components/Layout";

import {
  apiUrl
} from "../../config/api";


function StatCard({
  icon: Icon,
  label,
  value,
  tone = "slate"
}) {

  const tones = {
    slate: "bg-slate-100 text-slate-800",
    teal: "bg-teal-50 text-teal-700",
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone] || tones.slate}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}


function statusClass(status) {

  const normalized =
    String(status || "").toLowerCase();

  if (
    normalized.includes("book")
    || normalized.includes("confirm")
  ) {

    return "bg-teal-50 text-teal-700";
  }

  if (normalized.includes("cancel")) {

    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}


function urgencyClass(daysUntil) {

  if (daysUntil < 0) return "bg-red-50 text-red-700";
  if (daysUntil <= 3) return "bg-orange-50 text-orange-700";
  if (daysUntil <= 7) return "bg-amber-50 text-amber-700";

  return "bg-teal-50 text-teal-700";
}


function urgencyLabel(daysUntil) {

  if (daysUntil < 0) return `${Math.abs(daysUntil)}d overdue`;
  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";

  return `In ${daysUntil} days`;
}


function formatAppointmentDate(value) {

  if (!value) {

    return "-";
  }

  try {

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    ).format(
      new Date(`${value}T00:00:00`)
    );

  } catch {

    return value;
  }
}


function Field({
  label,
  children
}) {

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="mt-1.5">
        {children}
      </div>
    </label>
  );
}


const inputClass =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50";


export default function Appointments() {

  const clinicId =
    localStorage.getItem(
      "clinic_id"
    );

  const [appointments, setAppointments] =
    useState([]);

  const [shifts, setShifts] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [doctorFilter, setDoctorFilter] =
    useState("all");

  const [cancellingId, setCancellingId] =
    useState(null);

  const [creating, setCreating] =
    useState(false);

  const [slotLoading, setSlotLoading] =
    useState(false);

  const [manualSlots, setManualSlots] =
    useState([]);

  const [manualForm, setManualForm] =
    useState({
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

  const [activeTab, setActiveTab] =
    useState("appointments");

  const [showFollowUpModal, setShowFollowUpModal] =
    useState(false);

  const [selectedForFollowUp, setSelectedForFollowUp] =
    useState(null);

  const [followUpDate, setFollowUpDate] =
    useState("");

  const [savingFollowUp, setSavingFollowUp] =
    useState(false);

  const [sendingReminderId, setSendingReminderId] =
    useState(null);

  const [reminderSentIds, setReminderSentIds] =
    useState(new Set());

  const fetchAppointments =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");

        const [
          appointmentsResponse,
          shiftsResponse,
          doctorsResponse
        ] = await Promise.all([
          axios.get(
            apiUrl("/appointments"),
            {
              params: {
                clinic_id: clinicId
              }
            }
          ),
          axios.get(
            apiUrl(`/shifts/${clinicId}`)
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

        setAppointments(
          Array.isArray(appointmentsResponse.data)
            ? appointmentsResponse.data
            : []
        );

        const activeShifts =
          Array.isArray(shiftsResponse.data)
            ? shiftsResponse.data.filter((shift) => shift.is_active)
            : [];

        setShifts(
          activeShifts
        );

        const activeDoctors =
          Array.isArray(doctorsResponse.data)
            ? doctorsResponse.data.filter((doctor) => doctor.is_active !== false)
            : [];

        setDoctors(
          activeDoctors
        );

        setManualForm((current) => ({
          ...current,
          doctor_id:
            current.doctor_id
            || activeDoctors[0]?.id
            || activeShifts[0]?.doctor_id
            || "",
          doctor_name:
            current.doctor_name
            || activeDoctors[0]?.name
            || activeDoctors[0]?.doctor_name
            || activeShifts[0]?.doctor_name
            || ""
        }));

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to load appointments"
        );

      } finally {

        setLoading(false);
      }
    }, [clinicId]);

  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        fetchAppointments();

      }, 0);

    return () =>
      window.clearTimeout(timer);

  }, [fetchAppointments]);

  const statusOptions =
    useMemo(() => [
      "all",
      ...new Set(
        appointments
          .map((appointment) => appointment.status)
          .filter(Boolean)
      )
    ], [appointments]);

  const doctorOptions =
    useMemo(() => {

      const doctorMap = new Map();

      doctors.forEach((doctor) => {

        const id =
          doctor.id
            ? String(doctor.id)
            : doctor.doctor_name || doctor.name;

        if (!id || doctorMap.has(id)) {

          return;
        }

        doctorMap.set(id, {
          id,
          doctor_id: doctor.id || "",
          doctor_name: doctor.doctor_name || doctor.name
        });
      });

      shifts.forEach((shift) => {

        const id =
          shift.doctor_id
            ? String(shift.doctor_id)
            : shift.doctor_name;

        if (!id || doctorMap.has(id)) {

          return;
        }

        doctorMap.set(id, {
          id,
          doctor_id: shift.doctor_id || "",
          doctor_name: shift.doctor_name
        });
      });

      appointments.forEach((appointment) => {

        const id =
          appointment.doctor_id
            ? String(appointment.doctor_id)
            : appointment.doctor_name;

        if (!id || doctorMap.has(id)) {

          return;
        }

        doctorMap.set(id, {
          id,
          doctor_id: appointment.doctor_id || "",
          doctor_name: appointment.doctor_name
        });
      });

      return Array.from(
        doctorMap.values()
      );

    }, [
      appointments,
      doctors,
      shifts
    ]);

  const effectiveDoctorFilter =
    doctorOptions.length === 1
      ? doctorOptions[0].id
      : doctorFilter;

  const selectedDoctor =
    doctorOptions.find((doctor) =>
      doctor.id === effectiveDoctorFilter
    );

  const filteredAppointments =
    useMemo(() => {

      const normalizedQuery =
        query.trim().toLowerCase();

      return appointments.filter((appointment) => {

        const matchesStatus =
          statusFilter === "all"
          || appointment.status === statusFilter;

        const matchesDoctor =
          effectiveDoctorFilter === "all"
          || String(appointment.doctor_id || "") === effectiveDoctorFilter
          || (
            !appointment.doctor_id
            && selectedDoctor?.doctor_name
            && appointment.doctor_name === selectedDoctor.doctor_name
          );

        const searchable = [
          appointment.patient_name,
          appointment.phone_number,
          appointment.gender,
          appointment.created_by,
          appointment.doctor_name,
          appointment.problem,
          appointment.appointment_date,
          appointment.follow_up_date,
          appointment.appointment_time
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesStatus
          && matchesDoctor
          && (
            !normalizedQuery
            || searchable.includes(normalizedQuery)
          );
      });

    }, [
      appointments,
      effectiveDoctorFilter,
      query,
      selectedDoctor,
      statusFilter
    ]);

  const confirmedCount =
    filteredAppointments.filter((appointment) =>
      String(appointment.status || "")
        .toLowerCase()
        .includes("book")
    ).length;

  const doctorCount =
    new Set(
      filteredAppointments
        .map((appointment) => appointment.doctor_name)
        .filter(Boolean)
    ).size;

  const followUps =
    useMemo(() => {

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return appointments
        .filter((a) => a.follow_up_date && a.status !== "cancelled")
        .map((a) => {

          const followUpDay =
            new Date(`${a.follow_up_date}T00:00:00`);

          const daysUntil =
            Math.ceil(
              (followUpDay - today) / (1000 * 60 * 60 * 24)
            );

          return {
            ...a,
            days_until_follow_up: daysUntil
          };
        })
        .filter((a) => a.days_until_follow_up === 1)
        .sort((a, b) =>
          a.days_until_follow_up - b.days_until_follow_up
        );

    }, [appointments]);

  const loadManualSlots =
    useCallback(async () => {

      if (
        !manualForm.doctor_name
        || !manualForm.appointment_date
      ) {

        setError(
          "Choose doctor and appointment date first."
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
                doctor_id: manualForm.doctor_id || undefined,
                doctor_name: manualForm.doctor_name,
                appointment_date: manualForm.appointment_date
              }
            }
          );

        setManualSlots(
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
    }, [
      clinicId,
      manualForm.appointment_date,
      manualForm.doctor_id,
      manualForm.doctor_name
    ]);

  const updateManualForm =
    useCallback((field, value) => {

      setManualForm((current) => ({
        ...current,
        [field]: value,
        ...(field === "doctor_id"
          ? {
              doctor_name:
                doctorOptions.find((doctor) => doctor.id === value)
                  ?.doctor_name || ""
            }
          : {}),
        ...(field === "doctor_name"
          || field === "doctor_id"
          || field === "appointment_date"
          ? {
              appointment_time: ""
            }
          : {})
      }));

      if (
        field === "doctor_name"
        || field === "doctor_id"
        || field === "appointment_date"
      ) {

        setManualSlots([]);
      }
    }, [doctorOptions]);

  const createManualAppointment =
    useCallback(async (event) => {

      event.preventDefault();

      try {

        setCreating(true);
        setError("");

        const payload = {
          clinic_id: Number(clinicId),
          ...manualForm
        };

        if (!payload.follow_up_date) {
          delete payload.follow_up_date;
        }

        await axios.post(
          apiUrl("/appointments"),
          payload
        );

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

        await fetchAppointments();

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to create appointment"
        );

      } finally {

        setCreating(false);
      }
    }, [
      clinicId,
      doctorOptions,
      fetchAppointments,
      manualForm,
      shifts
    ]);

  const openFollowUpModal =
    useCallback((appointment) => {

      setSelectedForFollowUp(appointment);
      setFollowUpDate(appointment.follow_up_date || "");
      setShowFollowUpModal(true);

    }, []);

  const closeFollowUpModal =
    useCallback(() => {

      setShowFollowUpModal(false);
      setSelectedForFollowUp(null);
      setFollowUpDate("");

    }, []);

  const saveFollowUp =
    useCallback(async (event) => {

      event.preventDefault();

      if (!selectedForFollowUp || !followUpDate) {
        return;
      }

      try {

        setSavingFollowUp(true);
        setError("");

        await axios.patch(
          apiUrl(`/appointments/${selectedForFollowUp.id}/follow-up`),
          {
            clinic_id: Number(clinicId),
            follow_up_date: followUpDate
          }
        );

        closeFollowUpModal();
        await fetchAppointments();

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to set follow-up date"
        );

      } finally {

        setSavingFollowUp(false);
      }

    }, [
      clinicId,
      closeFollowUpModal,
      fetchAppointments,
      followUpDate,
      selectedForFollowUp
    ]);

  const sendReminder =
    useCallback(async (appointment) => {

      try {

        setSendingReminderId(appointment.id);
        setError("");

        await axios.post(
          apiUrl(`/appointments/${appointment.id}/follow-up/remind`),
          null,
          {
            params: {
              clinic_id: clinicId
            }
          }
        );

        setReminderSentIds((prev) =>
          new Set([...prev, appointment.id])
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to send reminder"
        );

      } finally {

        setSendingReminderId(null);
      }

    }, [clinicId]);

  const cancelAppointment =
    useCallback(async (appointment) => {

      const confirmed =
        window.confirm(
          `Cancel appointment #${appointment.appointment_no || appointment.id}?`
        );

      if (!confirmed) {

        return;
      }

      try {

        setCancellingId(
          appointment.id
        );

        await axios.put(
          apiUrl(`/appointments/${appointment.id}/cancel`),
          null,
          {
            params: {
              clinic_id: clinicId
            }
          }
        );

        await fetchAppointments();

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to cancel appointment"
        );

      } finally {

        setCancellingId(null);
      }
    }, [
      clinicId,
      fetchAppointments
    ]);

  const today =
    new Date().toISOString().split("T")[0];

  return (
    <Layout
      title="Appointments"
      subtitle="Search, filter, and review patient bookings from one clean workspace."
      actions={(
        <button
          type="button"
          onClick={fetchAppointments}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-slate-950 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      )}
    >
      {error && (
        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={CalendarCheck}
          label="Total appointments"
          value={filteredAppointments.length}
          tone="slate"
        />
        <StatCard
          icon={CalendarCheck}
          label="Confirmed"
          value={confirmedCount}
          tone="teal"
        />
        <StatCard
          icon={Stethoscope}
          label="Doctors"
          value={
            effectiveDoctorFilter === "all"
              ? doctorCount
              : 1
          }
          tone="cyan"
        />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
              <UserPlus size={14} />
              Walk-in
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-950">
              Book a physical visit
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Create a physical visit appointment using available doctor slots.
            </p>
          </div>
          <button
            type="button"
            onClick={loadManualSlots}
            disabled={slotLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 text-sm font-semibold text-teal-700 transition hover:border-teal-200 hover:bg-teal-100 disabled:opacity-60"
          >
            {slotLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={15} />
            )}
            Find slots
          </button>
        </div>

        <form
          onSubmit={createManualAppointment}
          className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        >
          <div className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2">
            <Field label="Doctor">
              <select
                value={manualForm.doctor_id || manualForm.doctor_name}
                onChange={(event) =>
                  updateManualForm(
                    "doctor_id",
                    event.target.value
                  )
                }
                disabled={doctorOptions.length <= 1}
                className={inputClass}
                required
              >
                {doctorOptions.length === 0 && (
                  <option value="">
                    No doctors configured
                  </option>
                )}
                {doctorOptions.map((doctor) => (
                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >
                    {doctor.doctor_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={manualForm.appointment_date}
                onChange={(event) =>
                  updateManualForm(
                    "appointment_date",
                    event.target.value
                  )
                }
                className={inputClass}
                required
              />
            </Field>

            <Field label="Follow-up date (optional)">
              <input
                type="date"
                value={manualForm.follow_up_date}
                min={today}
                onChange={(event) =>
                  updateManualForm(
                    "follow_up_date",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </Field>

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Available slots
                </span>
                {manualSlots.length > 0 && (
                  <span className="text-xs font-medium text-slate-500">
                    {manualSlots.length} open
                  </span>
                )}
              </div>
              <div className="min-h-20 rounded-lg border border-slate-200 bg-white p-2">
                {slotLoading ? (
                  <div className="flex min-h-16 items-center justify-center text-sm text-slate-500">
                    <Loader2 className="mr-2 animate-spin text-teal-600" size={16} />
                    Checking slots
                  </div>
                ) : manualSlots.length === 0 ? (
                  <div className="flex min-h-16 items-center justify-center text-sm text-slate-400">
                    Choose doctor/date and find slots.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {manualSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          updateManualForm(
                            "appointment_time",
                            slot
                          )
                        }
                        className={`min-h-9 rounded-lg border px-3 text-sm font-semibold transition ${
                          manualForm.appointment_time === slot
                            ? "border-slate-950 bg-slate-950 text-white"
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
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Patient name">
              <input
                type="text"
                placeholder="Patient name"
                value={manualForm.patient_name}
                onChange={(event) =>
                  updateManualForm(
                    "patient_name",
                    event.target.value
                  )
                }
                className={inputClass}
                required
              />
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                placeholder="Phone"
                value={manualForm.phone_number}
                onChange={(event) =>
                  updateManualForm(
                    "phone_number",
                    event.target.value
                  )
                }
                className={inputClass}
                required
              />
            </Field>

            <Field label="Age">
              <input
                type="text"
                placeholder="Age"
                value={manualForm.patient_age}
                onChange={(event) =>
                  updateManualForm(
                    "patient_age",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </Field>

            <Field label="Gender">
              <input
                type="text"
                placeholder="Gender"
                value={manualForm.patient_gender}
                onChange={(event) =>
                  updateManualForm(
                    "patient_gender",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </Field>

            <Field label="Health issue">
              <input
                type="text"
                placeholder="Health issue"
                value={manualForm.health_issue}
                onChange={(event) =>
                  updateManualForm(
                    "health_issue",
                    event.target.value
                  )
                }
                className={inputClass}
                required
              />
            </Field>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating || !manualForm.appointment_time}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={15} />
                )}
                Book visit
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Tab bar */}
      <div className="mt-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("appointments")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "appointments"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CalendarCheck size={15} />
          Appointment list
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("followups")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "followups"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CalendarClock size={15} />
          Follow-ups
          {followUps.length > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
              followUps.length > 0
                ? "bg-orange-100 text-orange-700"
                : "bg-slate-200 text-slate-600"
            }`}>
              {followUps.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── Appointment list tab ─── */}
      {activeTab === "appointments" && (
        <section className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Appointment list
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredAppointments.length} of {appointments.length} appointments.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100 sm:w-72">
                <Search
                  size={17}
                  className="shrink-0 text-slate-400"
                />
                <input
                  type="search"
                  placeholder="Search appointments"
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                <Stethoscope
                  size={17}
                  className="shrink-0 text-slate-400"
                />
                <span className="sr-only">
                  Viewing doctor
                </span>
                <select
                  value={
                    doctorOptions.length === 1
                      ? doctorOptions[0].id
                      : effectiveDoctorFilter
                  }
                  onChange={(event) =>
                    setDoctorFilter(
                      event.target.value
                    )
                  }
                  disabled={doctorOptions.length <= 1}
                  className="min-h-10 bg-transparent text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-500"
                >
                  {doctorOptions.length > 1 && (
                    <option value="all">
                      All doctors
                    </option>
                  )}
                  {doctorOptions.length === 0 && (
                    <option value="all">
                      No doctors configured
                    </option>
                  )}
                  {doctorOptions.map((doctor) => (
                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >
                      {doctor.doctor_name}
                    </option>
                  ))}
                </select>
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              >
                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status === "all" ? "All statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm text-slate-500">
              <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium text-slate-700">
                No appointments found.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try changing the search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-260 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Appointment</th>
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-5 py-3 font-semibold">Doctor</th>
                    <th className="px-5 py-3 font-semibold">Health Issue</th>
                    <th className="px-5 py-3 font-semibold">Follow-up</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">
                          #{appointment.appointment_no || appointment.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatAppointmentDate(appointment.appointment_date)} · {appointment.appointment_time || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {appointment.created_by || "WhatsApp"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">
                          {appointment.patient_name || "Patient"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {appointment.phone_number || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {appointment.gender || "Gender not set"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {appointment.doctor_name || "Doctor"}
                      </td>
                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {appointment.problem === "WhatsApp booking"
                            ? "Health issue not provided"
                            : appointment.problem || "Health issue not provided"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {appointment.follow_up_date ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <CalendarClock size={12} />
                            {formatAppointmentDate(appointment.follow_up_date)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClass(appointment.status)}`}>
                          {appointment.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5 sm:flex-row">
                          <button
                            type="button"
                            onClick={() =>
                              openFollowUpModal(
                                appointment
                              )
                            }
                            disabled={
                              String(appointment.status || "").toLowerCase() === "cancelled"
                            }
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <CalendarClock size={13} />
                            {appointment.follow_up_date ? "Edit follow-up" : "Set follow-up"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              cancelAppointment(
                                appointment
                              )
                            }
                            disabled={
                              cancellingId === appointment.id
                              || String(appointment.status || "").toLowerCase() === "cancelled"
                            }
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {cancellingId === appointment.id ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : (
                              <Ban size={13} />
                            )}
                            Cancel
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

      {/* ─── Follow-ups tab ─── */}
      {activeTab === "followups" && (
        <section className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <CalendarClock size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Tomorrow's follow-ups
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Patients with a follow-up scheduled for tomorrow. Send each a WhatsApp reminder once to book.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm text-slate-500">
              <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
              Loading...
            </div>
          ) : followUps.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CalendarClock size={22} />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No follow-ups due tomorrow.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Patients with a follow-up date set for tomorrow will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-5 py-3 font-semibold">Doctor</th>
                    <th className="px-5 py-3 font-semibold">Original visit</th>
                    <th className="px-5 py-3 font-semibold">Follow-up date</th>
                    <th className="px-5 py-3 font-semibold">Due in</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {followUps.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">
                          {appointment.patient_name || "Patient"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {appointment.phone_number || "No phone"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {appointment.doctor_name || "Doctor"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <p>{formatAppointmentDate(appointment.appointment_date)}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {appointment.appointment_time || ""}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">
                          {formatAppointmentDate(appointment.follow_up_date)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${urgencyClass(appointment.days_until_follow_up)}`}>
                          {urgencyLabel(appointment.days_until_follow_up)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5 sm:flex-row">
                          {reminderSentIds.has(appointment.id) ? (
                            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-teal-50 px-3 text-xs font-semibold text-teal-700">
                              <CheckCircle size={13} />
                              Reminder sent
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => sendReminder(appointment)}
                              disabled={
                                sendingReminderId === appointment.id
                                || !appointment.phone_number
                              }
                              title={
                                !appointment.phone_number
                                  ? "No phone number on record"
                                  : "Send WhatsApp reminder to book"
                              }
                              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {sendingReminderId === appointment.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Bell size={13} />
                              )}
                              Send reminder
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openFollowUpModal(appointment)}
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
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
                <h2 className="text-base font-semibold text-slate-950">
                  Set follow-up date
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Patient will be notified via WhatsApp to book before this date.
                </p>
              </div>
              <button
                type="button"
                onClick={closeFollowUpModal}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

              {/* Appointment context */}
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
                  {formatAppointmentDate(selectedForFollowUp?.appointment_date)}
                  {selectedForFollowUp?.appointment_time
                    ? ` · ${selectedForFollowUp.appointment_time}`
                    : ""}
                </p>
                {selectedForFollowUp?.phone_number && (
                  <p className="mt-2 text-xs font-medium text-teal-700">
                    WhatsApp → {selectedForFollowUp.phone_number}
                  </p>
                )}
                {!selectedForFollowUp?.phone_number && (
                  <p className="mt-2 text-xs text-orange-600">
                    No phone number on record — notification will not be sent.
                  </p>
                )}
              </div>

              <form
                onSubmit={saveFollowUp}
                className="mt-5 space-y-5"
              >
                <Field label="Follow-up date">
                  <input
                    type="date"
                    value={followUpDate}
                    min={today}
                    onChange={(event) =>
                      setFollowUpDate(event.target.value)
                    }
                    className={inputClass}
                    required
                    autoFocus
                  />
                </Field>

                {followUpDate && (
                  <p className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-800">
                    A WhatsApp message will be sent asking{" "}
                    <strong>{selectedForFollowUp?.patient_name}</strong> to book
                    a slot before{" "}
                    <strong>{formatAppointmentDate(followUpDate)}</strong>.
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeFollowUpModal}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFollowUp || !followUpDate}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
    </Layout>
  );
}
