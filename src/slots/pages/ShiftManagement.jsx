import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CalendarOff,
  Clock,
  X,
  Loader2,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";

import {
  createShift,
  createUnavailableTime,
  deleteUnavailableTime,
  getShifts,
  getUnavailableTimes,
  updateShift
} from "../services/slotApi";

import Layout
from "../../components/Layout";


const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun"
];


const TIME_STEP_MINUTES = 15;


const TIME_OPTIONS = Array.from(
  {
    length: (24 * 60) / TIME_STEP_MINUTES
  },
  (_, index) => minutesToTime(
    index * TIME_STEP_MINUTES
  )
);


function minutesToTime(
  value
) {

  const hours = Math.floor(
    Number(value) / 60
  );

  const minutes =
    Number(value) % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


function formatIstTime(
  value
) {

  if (!value) {

    return "Not set";
  }

  const [
    rawHours,
    rawMinutes
  ] = value.split(":").map(Number);

  const period =
    rawHours >= 12 ? "PM" : "AM";

  const hours =
    rawHours % 12 || 12;

  return `${hours}:${String(rawMinutes).padStart(2, "0")} ${period} IST`;
}


function TimeSelect({
  label,
  name,
  value,
  onChange,
  optional = false
}) {

  const [enabled, setEnabled] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const currentValue =
    value || "09:00";

  const isActive =
    !optional || enabled || Boolean(value);

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>
        <span className="text-xs font-medium text-slate-500">IST</span>
      </div>

      <div
        className={`mt-2 flex min-h-11 items-center gap-3 rounded-lg border bg-white px-3 transition ${
          isActive
            ? "border-slate-300 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100"
            : "border-slate-200 bg-slate-50 text-slate-400"
        }`}
      >
        <Clock
          size={17}
          className="shrink-0 text-slate-400"
        />

        <button
          type="button"
          disabled={!isActive}
          onClick={() =>
            setOpen(
              (value) => !value
            )
          }
          className="min-h-10 flex-1 text-left text-sm font-medium text-slate-950 outline-none disabled:text-slate-400"
        >
          {isActive ? formatIstTime(currentValue).replace(" IST", "") : "No break"}
        </button>

        {optional && isActive && (
          <button
            type="button"
            onClick={() => {
              setEnabled(false);
              setOpen(false);
              onChange({
                target: {
                  name,
                  value: ""
                }
              });
            }}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Clear ${label}`}
          >
            <X size={16} />
          </button>
        )}

        {optional && !isActive && (
          <button
            type="button"
            onClick={() => {
              setEnabled(true);
              onChange({
                target: {
                  name,
                  value: currentValue
                }
              });
              setOpen(true);
            }}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
          >
            Add
          </button>
        )}
      </div>

      {open && isActive && (
        <div className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl shadow-slate-950/10">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange({
                  target: {
                    name,
                    value: option
                  }
                });
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                option === currentValue
                  ? "bg-slate-100 font-semibold text-slate-950"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {formatIstTime(option).replace(" IST", "")}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}


function getStoredClinic() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "clinic"
      )
    );

  } catch {

    return null;
  }
}


function getErrorMessage(
  error,
  fallback
) {

  const detail =
    error.response?.data?.detail;

  if (Array.isArray(detail)) {

    return detail
      .map((item) => item.msg)
      .join(", ");
  }

  return detail || fallback;
}


function getNotificationStatus(
  appointmentId,
  notificationResults
) {

  return notificationResults.find(
    (item) => item.appointment_id === appointmentId
  );
}


function formatDateBadge(
  value
) {

  if (!value) {

    return {
      day: "--",
      month: "---",
      label: "Date not set"
    };
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (Number.isNaN(date.getTime())) {

    return {
      day: "--",
      month: "---",
      label: value
    };
  }

  return {
    day: new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit"
      }
    ).format(date),
    month: new Intl.DateTimeFormat(
      "en-IN",
      {
        month: "short"
      }
    ).format(date).toUpperCase(),
    label: new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    ).format(date)
  };
}


function datePart(
  value
) {

  return String(value || "")
    .split(/[T ]/)[0];
}


function timePart(
  value
) {

  const raw =
    String(value || "")
      .split(/[T ]/)[1]
      ?.slice(0, 5);

  return raw || "";
}


function Modal({
  title,
  children,
  onClose
}) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </section>
    </div>
  );
}


export default function ShiftManagement() {

  const clinic = useMemo(
    () => getStoredClinic(),
    []
  );

  const [shifts, setShifts] =
    useState([]);

  const [unavailableTimes, setUnavailableTimes] =
    useState([]);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [savingShift, setSavingShift] =
    useState(false);

  const [savingVacation, setSavingVacation] =
    useState(false);

  const [pendingActionId, setPendingActionId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [vacationConflicts, setVacationConflicts] =
    useState([]);

  const [notificationResults, setNotificationResults] =
    useState([]);

  const [showShiftModal, setShowShiftModal] =
    useState(false);

  const [showBlockModal, setShowBlockModal] =
    useState(false);

  const [formData, setFormData] =
    useState({
      working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      start_time: "09:00",
      end_time: "17:00",
      break_start: "",
      break_end: "",
      slot_duration: 10
    });

  const [vacationData, setVacationData] =
    useState({
      start_date: "",
      start_time: "09:00",
      end_date: "",
      end_time: "17:00",
      reason: ""
    });

  const currentShift =
    shifts[0] || null;


  const loadSchedule =
  useCallback(async () => {

    if (!clinic?.id) {

      setInitialLoading(false);
      setError("Clinic session not found. Please login again.");
      return;
    }

    try {

      setError("");

      const [
        shiftData,
        unavailableData
      ] = await Promise.all([
        getShifts(
          clinic.id
        ),
        getUnavailableTimes(
          clinic.id
        )
      ]);

      setShifts(
        shiftData.slice(
          0,
          1
        )
      );
      setUnavailableTimes(unavailableData);

      if (shiftData[0]) {

        setFormData({
          working_days: shiftData[0].working_days
            ? shiftData[0].working_days.split(",")
            : [],
          start_time: shiftData[0].start_time,
          end_time: shiftData[0].end_time,
          break_start: shiftData[0].break_start || "",
          break_end: shiftData[0].break_end || "",
          slot_duration: shiftData[0].slot_duration
        });
      }

    } catch (error) {

      console.log(error);
      setError(
        getErrorMessage(
          error,
          "Failed to load schedule"
        )
      );

    } finally {

      setInitialLoading(false);
    }
  }, [clinic?.id]);


  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        loadSchedule();

      }, 0);

    return () =>
      window.clearTimeout(timer);

  }, [loadSchedule]);


  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };


  const handleVacationChange = (event) => {

    const nextValue =
      event.target.value;

    setVacationData({
      ...vacationData,
      [event.target.name]: nextValue,
      ...(event.target.name === "start_date"
        ? {
            end_date: nextValue
          }
        : {})
    });
  };


  const toggleDay = (day) => {

    const selected =
      formData.working_days.includes(day);

    setFormData({
      ...formData,
      working_days: selected
        ? formData.working_days.filter(
            (item) => item !== day
          )
        : [...formData.working_days, day]
    });
  };


  const validateShift = () => {

    if (!formData.working_days.length) {

      return "Select at least one working day.";
    }

    if (formData.end_time <= formData.start_time) {

      return "Shift end time must be after start time.";
    }

    if (
      Boolean(formData.break_start)
      !== Boolean(formData.break_end)
    ) {

      return "Add both break start and break end, or leave both empty.";
    }

    if (
      formData.break_start
      && (
        formData.break_start < formData.start_time
        || formData.break_end > formData.end_time
        || formData.break_end <= formData.break_start
      )
    ) {

      return "Break must be inside shift hours and end after it starts.";
    }

    return "";
  };


  const handleAddShift =
  async () => {

    const validationMessage =
      validateShift();

    if (validationMessage) {

      setError(validationMessage);
      setSuccess("");
      return;
    }

    try {

      setSavingShift(true);
      setError("");
      setSuccess("");

      const payload = {
        clinic_id: clinic.id,
        doctor_name: clinic.doctor_name,
        working_days: formData.working_days,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_start: formData.break_start || null,
        break_end: formData.break_end || null,
        slot_duration: Number(formData.slot_duration)
      };

      if (currentShift) {

        await updateShift(
          currentShift.id,
          payload
        );

      } else {

        await createShift(
          payload
        );
      }

      await loadSchedule();

      setSuccess(
        currentShift
          ? "Schedule updated."
          : "Schedule created."
      );
      setShowShiftModal(false);

    } catch (error) {

      console.log(error);
      setError(
        getErrorMessage(
          error,
          "Failed to create shift"
        )
      );

    } finally {

      setSavingShift(false);
    }
  };


  const handleAddVacation =
  async () => {

    if (
      !vacationData.start_date
      || !vacationData.end_date
    ) {

      setError("Choose vacation start and end dates.");
      setSuccess("");
      return;
    }

    const startDateTime =
      `${vacationData.start_date}T${vacationData.start_time}`;

    const endDateTime =
      `${vacationData.end_date}T${vacationData.end_time}`;

    if (endDateTime <= startDateTime) {

      setError("Vacation end must be after start.");
      setSuccess("");
      return;
    }

    try {

      setSavingVacation(true);
      setError("");
      setSuccess("");
      setVacationConflicts([]);
      setNotificationResults([]);

      const result = await createUnavailableTime({
        clinic_id: clinic.id,
        doctor_name: clinic.doctor_name,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        reason: vacationData.reason || "Vacation"
      });

      setVacationData({
        start_date: "",
        start_time: "09:00",
        end_date: "",
        end_time: "17:00",
        reason: ""
      });

      await loadSchedule();

      setVacationConflicts(
        result.conflicts || []
      );
      setNotificationResults(
        result.notifications || []
      );

      setSuccess(
        result.conflicts?.length
          ? `Vacation blocked. ${result.conflicts.length} booked appointment needs rescheduling.`
          : "Vacation blocked."
      );
      setShowBlockModal(false);

    } catch (error) {

      console.log(error);
      setError(
        getErrorMessage(
          error,
          "Failed to add vacation"
        )
      );

    } finally {

      setSavingVacation(false);
    }
  };


  const handleDeleteVacation =
  async (unavailableId) => {

    try {

      setPendingActionId(
        `vacation-${unavailableId}`
      );
      setError("");
      setSuccess("");

      await deleteUnavailableTime(
        unavailableId
      );

      await loadSchedule();

    } catch (error) {

      console.log(error);
      setError(
        getErrorMessage(
          error,
          "Failed to remove vacation"
        )
      );

    } finally {

      setPendingActionId(null);
    }
  };


  return (

    <Layout
      title="Schedule"
      subtitle="Manage your clinic hours and block unavailable times."
      actions={(
        <button
          type="button"
          onClick={() => setShowBlockModal(true)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <Plus size={16} />
          Block Time
        </button>
      )}
    >

      {initialLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
          <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
          Loading schedule...
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700">
              {success}
            </div>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Clock size={21} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Current Working Hours
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {currentShift?.working_days || formData.working_days.join(", ")} · {formatIstTime(formData.start_time).replace(" IST", "")} - {formatIstTime(formData.end_time).replace(" IST", "")}
                  </p>
                  <span className="mt-2 inline-flex rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
                    {formData.slot_duration} min slots
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShiftModal(true)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-teal-200 px-4 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                <Pencil size={15} />
                Edit Working Hours
              </button>
            </div>
          </section>

          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                  <CalendarOff size={21} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Unavailable Time
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Times you are not available. Slots will not be generated.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockModal(true)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                <Clock size={15} />
                Block Time
              </button>
            </div>
          </section>

          {vacationConflicts.length > 0 && (
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 shadow-sm">
              <div className="border-b border-amber-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-amber-950">
                  Appointments to reschedule
                </h2>
                <p className="mt-1 text-sm text-amber-800">
                  These booked appointments overlap the blocked time. WhatsApp reschedule messages were attempted automatically.
                </p>
              </div>
              <div className="divide-y divide-amber-200">
                {vacationConflicts.map((appointment) => {
                  const notification = getNotificationStatus(
                    appointment.id,
                    notificationResults
                  );

                  return (
                    <div
                      key={appointment.id}
                      className="grid gap-2 px-5 py-4 text-sm text-amber-950 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div>
                        <p className="font-semibold">
                          {appointment.patient_name || "Patient"}
                        </p>
                        <p className="text-amber-800">
                          {appointment.phone_number || "No phone number"}
                        </p>
                      </div>
                      <div>
                        <p>
                          {appointment.appointment_date} at {appointment.appointment_time}
                        </p>
                        <p className="text-amber-800">
                          {appointment.doctor_name}
                        </p>
                      </div>
                      <span className={`inline-flex min-h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold ${
                        notification?.sent
                          ? "bg-teal-100 text-teal-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      >
                        {notification?.sent ? "Message sent" : "Needs manual call"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Upcoming Unavailable Times
              </h2>
            </div>

            {unavailableTimes.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No unavailable times saved.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {unavailableTimes.map((item) => {
                  const badge =
                    formatDateBadge(
                      datePart(item.start_datetime)
                    );

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                          <span className="text-sm font-bold">
                            {badge.day}
                          </span>
                          <span className="text-[10px] font-bold uppercase">
                            {badge.month}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">
                            {badge.label}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatIstTime(timePart(item.start_datetime)).replace(" IST", "")} - {formatIstTime(timePart(item.end_datetime)).replace(" IST", "")}
                            {item.reason ? ` · ${item.reason}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteVacation(item.id)}
                        disabled={pendingActionId === `vacation-${item.id}`}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-100 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        aria-label="Remove unavailable time"
                      >
                        {pendingActionId === `vacation-${item.id}` ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {showShiftModal && (
            <Modal
              title="Edit Working Hours"
              onClose={() => setShowShiftModal(false)}
            >
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Working days
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`min-h-9 rounded-lg px-4 text-sm font-semibold transition ${
                          formData.working_days.includes(day)
                            ? "bg-teal-700 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TimeSelect
                    label="Start time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                  />
                  <TimeSelect
                    label="End time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                  />
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Slot duration
                  </span>
                  <select
                    name="slot_duration"
                    value={formData.slot_duration}
                    onChange={handleChange}
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  >
                    {[10, 15, 20, 30, 45, 60].map((duration) => (
                      <option
                        key={duration}
                        value={duration}
                      >
                        {duration} min
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Break optional
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TimeSelect
                      label="Break start"
                      name="break_start"
                      value={formData.break_start}
                      onChange={handleChange}
                      optional
                    />
                    <TimeSelect
                      label="Break end"
                      name="break_end"
                      value={formData.break_end}
                      onChange={handleChange}
                      optional
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(false)}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddShift}
                    disabled={savingShift}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingShift && (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {showBlockModal && (
            <Modal
              title="Block Time"
              onClose={() => setShowBlockModal(false)}
            >
              <div className="space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Date
                  </span>
                  <input
                    type="date"
                    name="start_date"
                    value={vacationData.start_date}
                    onChange={handleVacationChange}
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TimeSelect
                    label="Start time"
                    name="start_time"
                    value={vacationData.start_time}
                    onChange={handleVacationChange}
                  />
                  <TimeSelect
                    label="End time"
                    name="end_time"
                    value={vacationData.end_time}
                    onChange={handleVacationChange}
                  />
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Reason optional
                  </span>
                  <input
                    type="text"
                    name="reason"
                    placeholder="Personal work"
                    value={vacationData.reason}
                    onChange={handleVacationChange}
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  The selected time will be blocked and no slots will be generated during this period.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(false)}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddVacation}
                    disabled={savingVacation}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingVacation && (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    )}
                    Block Time
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}

    </Layout>
  );
}
