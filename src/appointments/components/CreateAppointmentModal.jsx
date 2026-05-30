import { CalendarClock, Loader2, Plus, RefreshCw, X } from "lucide-react";

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

export default function CreateAppointmentModal({
  show,
  onClose,
  manualForm,
  updateManualForm,
  doctorOptions,
  todayStr,
  slotLoading,
  manualSlots,
  loadManualSlots,
  creating,
  onSubmit
}) {

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Create Appointment</h2>
            <p className="mt-0.5 text-sm text-slate-500">Book a physical visit using available doctor slots.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Doctor">
                <select
                  value={manualForm.doctor_id || manualForm.doctor_name}
                  onChange={(e) => updateManualForm("doctor_id", e.target.value)}
                  disabled={doctorOptions.length <= 1}
                  className={inputCls}
                  required
                >
                  {doctorOptions.length === 0 && <option value="">No doctors configured</option>}
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Available slots</span>
                <button
                  type="button"
                  onClick={loadManualSlots}
                  disabled={slotLoading || !manualForm.doctor_name || !manualForm.appointment_date}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 disabled:opacity-50"
                >
                  {slotLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
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
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !manualForm.appointment_time}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Book visit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
