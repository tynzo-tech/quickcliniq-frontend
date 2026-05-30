import { CalendarClock, Loader2, X } from "lucide-react";

const inputCls =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function formatDate(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
}

export default function FollowUpModal({
  show,
  onClose,
  appointment,
  followUpDate,
  setFollowUpDate,
  todayStr,
  saving,
  onSubmit
}) {

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/30" onClick={onClose} />
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
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{appointment?.patient_name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {appointment?.doctor_name} · #{appointment?.appointment_no || appointment?.id}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDate(appointment?.appointment_date)}
              {appointment?.appointment_time ? ` · ${appointment.appointment_time}` : ""}
            </p>
            {appointment?.phone_number && (
              <p className="mt-2 text-xs font-medium text-teal-700">
                WhatsApp → {appointment.phone_number}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-5">
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
                <strong>{appointment?.patient_name}</strong> to book before{" "}
                <strong>{formatDate(followUpDate)}</strong>.
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !followUpDate}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <CalendarClock size={15} />}
                Save &amp; notify
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
