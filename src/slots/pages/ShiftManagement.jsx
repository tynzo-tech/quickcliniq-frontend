import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CalendarOff,
  Clock,
  X,
  Loader2,
  Power,
  Trash2
} from "lucide-react";

import {
  createShift,
  createUnavailableTime,
  deleteUnavailableTime,
  getShifts,
  getUnavailableTimes,
  toggleShift,
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
    useState(Boolean(value));

  const [open, setOpen] =
    useState(false);

  useEffect(() => {

    setEnabled(Boolean(value));

  }, [value]);

  const currentValue =
    value || "09:00";

  const isActive =
    !optional || enabled;

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


  useEffect(() => {

    loadSchedule();

  }, []);


  const loadSchedule =
  async () => {

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
  };


  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };


  const handleVacationChange = (event) => {

    setVacationData({
      ...vacationData,
      [event.target.name]: event.target.value
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


  const handleToggle =
  async (shiftId) => {

    try {

      setPendingActionId(
        `shift-${shiftId}`
      );
      setError("");
      setSuccess("");

      await toggleShift(shiftId);
      await loadSchedule();

    } catch (error) {

      console.log(error);
      setError(
        getErrorMessage(
          error,
          "Failed to update shift"
        )
      );

    } finally {

      setPendingActionId(null);
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

    <Layout>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage shifts, breaks, and vacation blocks for {clinic?.doctor_name || "your doctor"}.
          </p>
        </div>
      </div>

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

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                  <Clock size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Shift hours
                  </h2>
                  <p className="text-sm text-slate-500">
                    Edit clinic working hours and optional break time.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TimeSelect
                  label="Start"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                />

                <TimeSelect
                  label="End"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                />

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

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Slot duration
                  </span>
                  <input
                    type="number"
                    name="slot_duration"
                    min="1"
                    max="240"
                    value={formData.slot_duration}
                    onChange={handleChange}
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAddShift}
                  disabled={savingShift}
                  className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingShift && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}
                  {savingShift
                    ? "Saving"
                    : currentShift
                      ? "Update schedule"
                      : "Create schedule"}
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`min-h-10 rounded-lg px-4 text-sm font-medium transition ${
                      formData.working_days.includes(day)
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <CalendarOff size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Vacation block
                  </h2>
                  <p className="text-sm text-slate-500">
                    Block unavailable dates from generated slots.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="date"
                  name="start_date"
                  value={vacationData.start_date}
                  onChange={handleVacationChange}
                  className="min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />

                <TimeSelect
                  label="Start time"
                  name="start_time"
                  value={vacationData.start_time}
                  onChange={handleVacationChange}
                />

                <input
                  type="date"
                  name="end_date"
                  value={vacationData.end_date}
                  onChange={handleVacationChange}
                  className="min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />

                <TimeSelect
                  label="End time"
                  name="end_time"
                  value={vacationData.end_time}
                  onChange={handleVacationChange}
                />
                <input
                  type="text"
                  name="reason"
                  placeholder="Reason"
                  value={vacationData.reason}
                  onChange={handleVacationChange}
                  className="min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:col-span-2"
                />
                <button
                  type="button"
                  onClick={handleAddVacation}
                  disabled={savingVacation}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {savingVacation && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}
                  {savingVacation ? "Blocking" : "Block vacation"}
                </button>
              </div>
            </section>
          </div>

          {vacationConflicts.length > 0 && (
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 shadow-sm">
              <div className="border-b border-amber-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-amber-950">
                  Appointments to reschedule
                </h2>
                <p className="mt-1 text-sm text-amber-800">
                  These booked appointments overlap the vacation block. WhatsApp reschedule messages were attempted automatically.
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
              <h2 className="text-lg font-semibold text-slate-950">
                Current schedule
              </h2>
            </div>

            {shifts.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No schedule saved yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-3">Doctor</th>
                      <th className="px-5 py-3">Days</th>
                      <th className="px-5 py-3">Hours</th>
                      <th className="px-5 py-3">Break</th>
                      <th className="px-5 py-3">Duration</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift) => (
                      <tr
                        key={shift.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {shift.doctor_name}
                        </td>
                        <td className="px-5 py-4">{shift.working_days}</td>
                        <td className="px-5 py-4">{formatIstTime(shift.start_time)} - {formatIstTime(shift.end_time)}</td>
                        <td className="px-5 py-4">
                          {shift.break_start && shift.break_end
                            ? `${formatIstTime(shift.break_start)} - ${formatIstTime(shift.break_end)}`
                            : "No break"}
                        </td>
                        <td className="px-5 py-4">{shift.slot_duration} min</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                            shift.is_active
                              ? "bg-teal-50 text-teal-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          >
                            {shift.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggle(shift.id)}
                            disabled={pendingActionId === `shift-${shift.id}`}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                          >
                            {pendingActionId === `shift-${shift.id}` ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Power size={15} />
                            )}
                            {shift.is_active ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-950">
                Vacation and unavailable time
              </h2>
            </div>

            {unavailableTimes.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No vacation blocks saved.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {unavailableTimes.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-950">
                        {item.reason || "Unavailable"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.start_datetime} to {item.end_datetime} IST
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVacation(item.id)}
                      disabled={pendingActionId === `vacation-${item.id}`}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-100 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
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
                ))}
              </div>
            )}
          </section>
        </>
      )}

    </Layout>
  );
}
