import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  CalendarDays,
  CalendarOff,
  Clock,
  Lightbulb,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Timer,
  Trash2,
  X
} from "lucide-react";

import {
  createShift,
  createUnavailableTime,
  deleteUnavailableTime,
  getShifts,
  getUnavailableTimes,
  updateShift
} from "../services/slotApi";

import Layout from "../../components/Layout";

import { apiUrl } from "../../config/api";


const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
};

const TIME_STEP_MINUTES = 15;

const TIME_OPTIONS = Array.from(
  { length: (24 * 60) / TIME_STEP_MINUTES },
  (_, i) => minutesToTime(i * TIME_STEP_MINUTES)
);

const DEFAULT_SHIFT = {
  working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  start_time: "09:00",
  end_time: "17:00",
  break_start: "",
  break_end: "",
  slot_duration: 10
};


function minutesToTime(v) {
  const h = Math.floor(Number(v) / 60);
  const m = Number(v) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function fmt(value) {
  if (!value) return "—";
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function datePart(v) {
  return String(v || "").split(/[T ]/)[0];
}

function timePart(v) {
  return String(v || "").split(/[T ]/)[1]?.slice(0, 5) || "";
}

function formatDateBadge(v) {
  if (!v) return { day: "--", month: "---", label: "—" };
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: "--", month: "---", label: v };
  const locale = "en-IN";
  return {
    day: new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(d),
    month: new Intl.DateTimeFormat(locale, { month: "short" }).format(d).toUpperCase(),
    label: new Intl.DateTimeFormat(locale, { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).format(d)
  };
}

function getStoredClinic() {
  try { return JSON.parse(localStorage.getItem("clinic")); } catch { return null; }
}

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((i) => i.msg).join(", ");
  return detail || fallback;
}

function getNotificationStatus(id, results) {
  return results.find((r) => r.appointment_id === id);
}


// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}


function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}


function TimeSelect({ label, name, value, onChange, optional = false }) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const current = value || "09:00";
  const active = !optional || enabled || Boolean(value);

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-400">IST</span>
      </div>
      <div className={`flex min-h-10 items-center gap-2 rounded-lg border bg-white px-3 transition ${
        active ? "border-slate-300 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100" : "border-slate-200 bg-slate-50"
      }`}>
        <Clock size={15} className="shrink-0 text-slate-400" />
        <button
          type="button"
          disabled={!active}
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left text-sm font-medium text-slate-950 outline-none disabled:text-slate-400"
        >
          {active ? fmt(current) : "No break"}
        </button>
        {optional && active && (
          <button type="button" onClick={() => { setEnabled(false); setOpen(false); onChange({ target: { name, value: "" } }); }}>
            <X size={15} className="text-slate-400" />
          </button>
        )}
        {optional && !active && (
          <button
            type="button"
            onClick={() => { setEnabled(true); onChange({ target: { name, value: current } }); setOpen(true); }}
            className="rounded border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-white"
          >
            Add
          </button>
        )}
      </div>
      {open && active && (
        <div className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl shadow-slate-950/10">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange({ target: { name, value: opt } }); setOpen(false); }}
              className={`block w-full px-4 py-2 text-left text-sm transition ${opt === current ? "bg-slate-100 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {fmt(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── Main component ───────────────────────────────────────────────────────────

export default function ShiftManagement() {
  const clinic = useMemo(() => getStoredClinic(), []);

  const [shifts, setShifts] = useState([]);
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVacation, setSavingVacation] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vacationConflicts, setVacationConflicts] = useState([]);
  const [notificationResults, setNotificationResults] = useState([]);

  // Modal states
  const [editingDay, setEditingDay] = useState(null);   // "Mon" | null
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBlocksAll, setShowBlocksAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Form for editing a single day
  const [dayForm, setDayForm] = useState({
    is_available: true,
    start_time: "09:00",
    end_time: "17:00",
    break_start: "",
    break_end: "",
    slot_duration: 10
  });

  // Form for "Apply to multiple days"
  const [applyDays, setApplyDays] = useState([]);

  const [vacationData, setVacationData] = useState({
    start_date: "",
    start_time: "09:00",
    end_date: "",
    end_time: "17:00",
    reason: ""
  });


  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d.id) === String(selectedDoctorId)) || null,
    [doctors, selectedDoctorId]
  );

  const selectedDoctorName = selectedDoctor?.doctor_name || selectedDoctor?.name || "";

  const currentShift = useMemo(
    () => shifts.find((s) =>
      String(s.doctor_id || "") === String(selectedDoctorId)
      || (!s.doctor_id && selectedDoctorName && s.doctor_name === selectedDoctorName)
    ) || null,
    [selectedDoctorId, selectedDoctorName, shifts]
  );

  const shiftForm = useMemo(() => {
    if (!currentShift) return DEFAULT_SHIFT;
    return {
      working_days: currentShift.working_days ? currentShift.working_days.split(",") : [],
      start_time: currentShift.start_time || "09:00",
      end_time: currentShift.end_time || "17:00",
      break_start: currentShift.break_start || "",
      break_end: currentShift.break_end || "",
      slot_duration: currentShift.slot_duration || 10
    };
  }, [currentShift]);

  const filteredBlocks = useMemo(() => {
    if (!selectedDoctorId) return unavailableTimes;
    return unavailableTimes.filter((item) =>
      String(item.doctor_id || "") === String(selectedDoctorId)
      || (!item.doctor_id && selectedDoctorName && item.doctor_name === selectedDoctorName)
    );
  }, [selectedDoctorId, selectedDoctorName, unavailableTimes]);

  const visibleBlocks = showBlocksAll ? filteredBlocks : filteredBlocks.slice(0, 3);


  // ── Load ──────────────────────────────────────────────────────────────────

  const loadSchedule = useCallback(async () => {
    if (!clinic?.id) {
      setInitialLoading(false);
      setError("Clinic session not found. Please login again.");
      return;
    }
    try {
      setError("");
      const [shiftData, unavailableData, docRes] = await Promise.all([
        getShifts(clinic.id),
        getUnavailableTimes(clinic.id),
        axios.get(apiUrl("/doctors"), { params: { clinic_id: clinic.id } })
      ]);
      setShifts(Array.isArray(shiftData) ? shiftData : []);
      setUnavailableTimes(unavailableData);
      const active = Array.isArray(docRes.data)
        ? docRes.data.filter((d) => d.is_active !== false)
        : [];
      setDoctors(active);
      setSelectedDoctorId((cur) => {
        const exists = active.some((d) => String(d.id) === String(cur));
        return exists ? cur : active[0]?.id ? String(active[0].id) : "";
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load schedule"));
    } finally {
      setInitialLoading(false);
    }
  }, [clinic?.id]);

  useEffect(() => {
    const t = window.setTimeout(() => loadSchedule(), 0);
    return () => window.clearTimeout(t);
  }, [loadSchedule]);


  // ── Save shift ────────────────────────────────────────────────────────────

  async function saveShift(payload) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (currentShift) {
        await updateShift(currentShift.id, payload);
      } else {
        await createShift(payload);
      }
      await loadSchedule();
      setSuccess("Schedule updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save schedule"));
    } finally {
      setSaving(false);
    }
  }


  // ── Per-day edit ──────────────────────────────────────────────────────────

  function openDayEdit(day) {
    const isActive = shiftForm.working_days.includes(day);
    setDayForm({
      is_available: isActive,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      break_start: shiftForm.break_start,
      break_end: shiftForm.break_end,
      slot_duration: shiftForm.slot_duration
    });
    setEditingDay(day);
  }

  function handleDayFormChange(e) {
    setDayForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSaveDayHours() {
    let newWorkingDays;
    if (!dayForm.is_available) {
      newWorkingDays = shiftForm.working_days.filter((d) => d !== editingDay);
    } else {
      const ordered = DAYS.filter(
        (d) => d === editingDay || shiftForm.working_days.includes(d)
      );
      newWorkingDays = ordered;
    }

    if (dayForm.is_available && dayForm.end_time <= dayForm.start_time) {
      setError("End time must be after start time.");
      return;
    }

    await saveShift({
      clinic_id: clinic.id,
      doctor_id: selectedDoctor?.id || null,
      doctor_name: selectedDoctorName || clinic.doctor_name,
      working_days: newWorkingDays,
      start_time: dayForm.start_time,
      end_time: dayForm.end_time,
      break_start: dayForm.break_start || null,
      break_end: dayForm.break_end || null,
      slot_duration: Number(dayForm.slot_duration)
    });
    setEditingDay(null);
  }


  // ── Apply to multiple days ────────────────────────────────────────────────

  function openApplyModal() {
    setApplyDays([...shiftForm.working_days]);
    setShowApplyModal(true);
  }

  function toggleApplyDay(day) {
    setApplyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleApplyDays() {
    const ordered = DAYS.filter((d) => applyDays.includes(d));
    await saveShift({
      clinic_id: clinic.id,
      doctor_id: selectedDoctor?.id || null,
      doctor_name: selectedDoctorName || clinic.doctor_name,
      working_days: ordered,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      break_start: shiftForm.break_start || null,
      break_end: shiftForm.break_end || null,
      slot_duration: Number(shiftForm.slot_duration)
    });
    setShowApplyModal(false);
  }


  // ── Block time ────────────────────────────────────────────────────────────

  function handleVacationChange(e) {
    const v = e.target.value;
    setVacationData((prev) => ({
      ...prev,
      [e.target.name]: v,
      ...(e.target.name === "start_date" ? { end_date: v } : {})
    }));
  }

  async function handleAddVacation() {
    if (!vacationData.start_date || !vacationData.end_date) {
      setError("Choose start and end dates.");
      return;
    }
    const start = `${vacationData.start_date}T${vacationData.start_time}`;
    const end = `${vacationData.end_date}T${vacationData.end_time}`;
    if (end <= start) {
      setError("End must be after start.");
      return;
    }
    setSavingVacation(true);
    setError("");
    setSuccess("");
    setVacationConflicts([]);
    setNotificationResults([]);
    try {
      const result = await createUnavailableTime({
        clinic_id: clinic.id,
        doctor_id: selectedDoctor?.id || null,
        doctor_name: selectedDoctorName || clinic.doctor_name,
        start_datetime: start,
        end_datetime: end,
        reason: vacationData.reason || "Vacation"
      });
      setVacationData({ start_date: "", start_time: "09:00", end_date: "", end_time: "17:00", reason: "" });
      await loadSchedule();
      setVacationConflicts(result.conflicts || []);
      setNotificationResults(result.notifications || []);
      setSuccess(
        result.conflicts?.length
          ? `Time blocked. ${result.conflicts.length} appointment(s) need rescheduling.`
          : "Time blocked successfully."
      );
      setShowBlockModal(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to block time"));
    } finally {
      setSavingVacation(false);
    }
  }

  async function handleDeleteBlock(id) {
    setPendingDeleteId(id);
    setError("");
    try {
      await deleteUnavailableTime(id);
      await loadSchedule();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to remove block"));
    } finally {
      setPendingDeleteId(null);
      setOpenMenuId(null);
    }
  }


  // ── Render ────────────────────────────────────────────────────────────────

  const workingDaysLabel = shiftForm.working_days.length
    ? `${shiftForm.working_days[0]}–${shiftForm.working_days[shiftForm.working_days.length - 1]}`
    : "None";

  return (
    <Layout
      title={`Schedule — ${selectedDoctorName || "Doctor"}`}
      subtitle={`Showing schedule for ${selectedDoctorName || "doctor"}`}
      actions={(
        <div className="flex items-center gap-2">
          {/* Doctor selector */}
          {doctors.length > 1 && (
            <label className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="bg-transparent text-sm font-semibold outline-none"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.doctor_name || d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={openApplyModal}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <CalendarDays size={15} />
            Apply to multiple days
          </button>
          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Plus size={15} />
            Block Time
          </button>
        </div>
      )}
    >
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-16 text-slate-500 shadow-sm">
          <Loader2 className="mb-3 animate-spin text-teal-600" size={28} />
          Loading schedule…
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700">
              {success}
            </div>
          )}

          {/* ── Stat cards ─────────────────────────────────────────────── */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Working days"
              value={workingDaysLabel}
              icon={<CalendarDays size={20} />}
            />
            <StatCard
              label="Clinic hours"
              value={`${fmt(shiftForm.start_time)} – ${fmt(shiftForm.end_time)}`}
              icon={<Clock size={20} />}
            />
            <StatCard
              label="Slot duration"
              value={`${shiftForm.slot_duration} min`}
              icon={<Timer size={20} />}
            />
            <StatCard
              label="Upcoming blocks"
              value={filteredBlocks.length}
              icon={<CalendarOff size={20} />}
            />
          </div>

          {/* ── Two-column layout ───────────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

            {/* ── Weekly table ─────────────────────────────────────────── */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-950">
                  Weekly working hours
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">Day</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Start Time</th>
                      <th className="px-4 py-3">End Time</th>
                      <th className="px-4 py-3">Break Start</th>
                      <th className="px-4 py-3">Break End</th>
                      <th className="px-4 py-3">Slot Duration</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DAYS.map((day) => {
                      const active = shiftForm.working_days.includes(day);
                      return (
                        <tr key={day} className="transition hover:bg-slate-50/60">
                          <td className="px-5 py-3.5 font-medium text-slate-800">
                            {day}
                          </td>
                          <td className="px-4 py-3.5">
                            {active ? (
                              <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                                Off
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            {active ? fmt(shiftForm.start_time) : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            {active ? fmt(shiftForm.end_time) : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">
                            {active && shiftForm.break_start ? fmt(shiftForm.break_start) : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">
                            {active && shiftForm.break_end ? fmt(shiftForm.break_end) : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            {active ? `${shiftForm.slot_duration} min` : "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => openDayEdit(day)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
                Times are in IST (Asia/Kolkata)
              </p>
            </section>

            {/* ── Right sidebar ─────────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Unavailable blocks */}
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <CalendarOff size={15} className="text-slate-500" />
                    <h2 className="text-sm font-semibold text-slate-950">
                      Unavailable time blocks
                    </h2>
                  </div>
                </div>

                {filteredBlocks.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-slate-400">
                    No blocks scheduled.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {visibleBlocks.map((item) => {
                      const badge = formatDateBadge(datePart(item.start_datetime));
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 px-4 py-3"
                        >
                          <div className="flex h-11 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <span className="text-xs font-bold">{badge.month}</span>
                            <span className="text-base font-bold leading-none">{badge.day}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-900">
                              {badge.label}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {fmt(timePart(item.start_datetime))} – {fmt(timePart(item.end_datetime))}
                            </p>
                            {item.reason && (
                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {item.reason}
                              </p>
                            )}
                          </div>
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openMenuId === item.id && (
                              <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBlock(item.id)}
                                  disabled={pendingDeleteId === item.id}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  {pendingDeleteId === item.id
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : <Trash2 size={12} />}
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filteredBlocks.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowBlocksAll((v) => !v)}
                    className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-3 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                  >
                    {showBlocksAll
                      ? "Show less"
                      : `View all ${filteredBlocks.length} blocks →`}
                  </button>
                )}
              </section>

              {/* Availability notes */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb size={15} className="text-amber-500" />
                  <h2 className="text-sm font-semibold text-slate-950">
                    Availability notes
                  </h2>
                </div>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    Slots are auto-generated from working hours.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    Blocked times are excluded from booking.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    All times are in IST (Asia/Kolkata).
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* ── Vacation conflicts ──────────────────────────────────────── */}
          {vacationConflicts.length > 0 && (
            <section className="mt-5 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
              <div className="border-b border-amber-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-amber-950">
                  Appointments to reschedule ({vacationConflicts.length})
                </h2>
                <p className="mt-0.5 text-xs text-amber-700">
                  These overlap the blocked time. WhatsApp messages were sent automatically.
                </p>
              </div>
              <div className="divide-y divide-amber-200">
                {vacationConflicts.map((appt) => {
                  const notif = getNotificationStatus(appt.id, notificationResults);
                  return (
                    <div
                      key={appt.id}
                      className="grid gap-2 px-5 py-3 text-sm text-amber-950 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div>
                        <p className="font-semibold">{appt.patient_name || "Patient"}</p>
                        <p className="text-xs text-amber-700">{appt.phone_number || "—"}</p>
                      </div>
                      <div className="text-xs">
                        <p>{appt.appointment_date} at {appt.appointment_time}</p>
                        <p className="text-amber-700">{appt.doctor_name}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-lg px-3 text-xs font-semibold ${
                        notif?.sent ? "bg-teal-100 text-teal-800" : "bg-red-100 text-red-800"
                      }`}>
                        {notif?.sent ? "Message sent" : "Needs manual call"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Per-day edit modal ──────────────────────────────────────── */}
          {editingDay && (
            <Modal title={`Edit ${DAY_FULL[editingDay]} Hours`} onClose={() => setEditingDay(null)}>
              <div className="space-y-5">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dayForm.is_available}
                    onChange={(e) => setDayForm((p) => ({ ...p, is_available: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Doctor is available on {DAY_FULL[editingDay]}
                  </span>
                </label>

                {dayForm.is_available && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TimeSelect label="Start time" name="start_time" value={dayForm.start_time} onChange={handleDayFormChange} />
                      <TimeSelect label="End time" name="end_time" value={dayForm.end_time} onChange={handleDayFormChange} />
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Break (optional)
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TimeSelect label="Break start" name="break_start" value={dayForm.break_start} onChange={handleDayFormChange} optional />
                        <TimeSelect label="Break end" name="break_end" value={dayForm.break_end} onChange={handleDayFormChange} optional />
                      </div>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Slot duration</span>
                      <select
                        name="slot_duration"
                        value={dayForm.slot_duration}
                        onChange={handleDayFormChange}
                        className="mt-2 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      >
                        {[5, 10, 15, 20, 30, 45, 60].map((d) => (
                          <option key={d} value={d}>{d} min</option>
                        ))}
                      </select>
                    </label>

                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Hours apply to all active working days.
                    </p>
                  </>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingDay(null)}
                    className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDayHours}
                    disabled={saving}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* ── Apply to multiple days modal ────────────────────────────── */}
          {showApplyModal && (
            <Modal title="Apply to multiple days" onClose={() => setShowApplyModal(false)}>
              <div className="space-y-5">
                <p className="text-sm text-slate-600">
                  Select which days should use the current hours ({fmt(shiftForm.start_time)} – {fmt(shiftForm.end_time)}).
                </p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleApplyDay(day)}
                      className={`min-h-9 rounded-lg px-4 text-sm font-semibold transition ${
                        applyDays.includes(day)
                          ? "bg-teal-700 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyDays}
                    disabled={saving || applyDays.length === 0}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    Apply
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* ── Block time modal ────────────────────────────────────────── */}
          {showBlockModal && (
            <Modal title="Block Time" onClose={() => setShowBlockModal(false)}>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Date</span>
                  <input
                    type="date"
                    name="start_date"
                    value={vacationData.start_date}
                    onChange={handleVacationChange}
                    className="mt-2 min-h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TimeSelect label="Start time" name="start_time" value={vacationData.start_time} onChange={handleVacationChange} />
                  <TimeSelect label="End time" name="end_time" value={vacationData.end_time} onChange={handleVacationChange} />
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Reason (optional)</span>
                  <input
                    type="text"
                    name="reason"
                    placeholder="Personal Appointment, Seminar…"
                    value={vacationData.reason}
                    onChange={handleVacationChange}
                    className="mt-2 min-h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
                <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  No slots will be generated during blocked time. Existing bookings will need manual rescheduling.
                </p>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(false)}
                    className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddVacation}
                    disabled={savingVacation}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                  >
                    {savingVacation && <Loader2 size={15} className="animate-spin" />}
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
