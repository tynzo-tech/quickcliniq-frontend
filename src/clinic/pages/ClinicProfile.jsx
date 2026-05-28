import {
  useCallback,
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  Building2,
  Camera,
  Clock,
  Globe,
  Hash,
  Info,
  Loader2,
  Phone,
  Stethoscope,
  Timer,
  UserRound
} from "lucide-react";

import Layout from "../../components/Layout";

import { apiUrl } from "../../config/api";


function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function ReadOnly({ icon: Icon, value, placeholder = "—" }) {
  return (
    <div className="flex min-h-11 items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-600">
      {Icon && <Icon size={15} className="shrink-0 text-slate-400" />}
      <span>{value || placeholder}</span>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", required }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-50"
    />
  );
}


export default function ClinicProfile() {

  const clinicId = localStorage.getItem("clinic_id");

  const emptyForm = {
    clinic_id: Number(clinicId),
    name: "",
    doctor_name: "",
    specialization: "",
    timings: "",
    address: "",
    city: "",
    phone_number: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [slotDuration, setSlotDuration] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ msg: "", error: false });

  const showToast = (message, error = false) => {
    setToast({ msg: message, error });
    window.setTimeout(
      () => setToast({ msg: "", error: false }),
      3500
    );
  };


  const loadProfile = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        apiUrl(`/clinic-profile/${clinicId}`)
      );

      const { clinic, whatsapp_numbers, doctors } = res.data;

      const loaded = {
        clinic_id: Number(clinicId),
        name: clinic.name || "",
        doctor_name: clinic.doctor_name || "",
        specialization: clinic.specialization || "",
        timings: clinic.timings || "",
        address: clinic.address || "",
        city: clinic.city || "",
        phone_number: clinic.phone_number || ""
      };

      setForm(loaded);
      setSavedForm(loaded);

      const activeWa = whatsapp_numbers?.find((w) => w.is_active);
      setWhatsappNumber(activeWa?.display_phone_number || "");

      // Slot duration from first active doctor's consultation_duration
      const primaryDoctor = doctors?.find((d) => !d.is_deleted);
      setSlotDuration(primaryDoctor?.consultation_duration || null);

    } catch (e) {

      showToast(
        e.response?.data?.detail || "Failed to load profile",
        true
      );

    } finally {

      setLoading(false);
    }

  }, [clinicId]);


  useEffect(() => {

    const t = window.setTimeout(loadProfile, 0);
    return () => window.clearTimeout(t);

  }, [loadProfile]);


  const update = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const discard = () => setForm(savedForm);


  const save = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      const res = await axios.put(
        apiUrl("/clinic-profile"),
        form
      );

      localStorage.setItem(
        "clinic",
        JSON.stringify(res.data.clinic)
      );

      const updated = {
        clinic_id: Number(clinicId),
        name: res.data.clinic.name || "",
        doctor_name: res.data.clinic.doctor_name || "",
        specialization: res.data.clinic.specialization || "",
        timings: res.data.clinic.timings || "",
        address: res.data.clinic.address || "",
        city: res.data.clinic.city || "",
        phone_number: res.data.clinic.phone_number || ""
      };

      setForm(updated);
      setSavedForm(updated);

      showToast("Profile saved successfully.");

    } catch (e) {

      showToast(
        e.response?.data?.detail || "Failed to save profile",
        true
      );

    } finally {

      setSaving(false);
    }
  };


  // Clinic initials for the logo placeholder
  const clinicInitials = (form.name || "QC")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  // Clinic code derived from ID
  const clinicCode = `QC-${String(clinicId || 0).padStart(4, "0")}`;


  if (loading) {

    return (
      <Layout
        title="Clinic Profile"
        subtitle="Manage your clinic's information and identity."
      >
        <div className="py-20 text-center">
          <Loader2 size={24} className="mx-auto mb-3 animate-spin text-teal-600" />
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </Layout>
    );
  }


  return (
    <Layout
      title="Clinic Profile"
      subtitle="Manage your clinic's information and identity."
    >

      {/* Toast */}
      {toast.msg && (
        <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
          toast.error
            ? "border-red-100 bg-red-50 text-red-700"
            : "border-teal-100 bg-teal-50 text-teal-700"
        }`}>
          {toast.msg}
        </div>
      )}

      <form
        onSubmit={save}
        className="space-y-5"
      >

        {/* ─── Clinic details ──────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
              <Building2 size={18} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Clinic details
              </h2>
              <p className="text-xs text-slate-500">
                Basic information shown to patients and on reports.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Field label="Clinic name">
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Sandhya Clinic"
                  required
                />
              </Field>
            </div>

            <Field label="Primary doctor">
              <Input
                value={form.doctor_name}
                onChange={(e) => update("doctor_name", e.target.value)}
                placeholder="e.g. Dr. Sandhya"
                required
              />
            </Field>

            <Field label="Specialization">
              <Input
                value={form.specialization}
                onChange={(e) => update("specialization", e.target.value)}
                placeholder="e.g. General Medicine"
              />
            </Field>

            <Field label="Consultation hours">
              <Input
                value={form.timings}
                onChange={(e) => update("timings", e.target.value)}
                placeholder="e.g. 9:00 AM – 6:00 PM"
              />
            </Field>

            <Field label="Clinic phone">
              <Input
                type="tel"
                value={form.phone_number}
                onChange={(e) => update("phone_number", e.target.value)}
                placeholder="e.g. 8297997929"
                required
              />
            </Field>

            <Field label="WhatsApp number">
              <ReadOnly
                icon={Phone}
                value={whatsappNumber}
                placeholder="Not configured"
              />
            </Field>

            <Field label="Address">
              <Input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Street, building, landmark..."
              />
            </Field>

            <Field label="City / Area">
              <Input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Hyderabad"
              />
            </Field>

          </div>
        </div>


        {/* ─── Clinic identity ─────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
              <Hash size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Clinic identity
              </h2>
              <p className="text-xs text-slate-500">
                Read-only identifiers and system settings for your clinic.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Logo */}
            <div className="sm:col-span-2">
              <Field label="Logo">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold text-white">
                    {clinicInitials}
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 opacity-50 cursor-not-allowed"
                    >
                      <Camera size={14} />
                      Upload logo
                    </button>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Logo upload coming soon.
                    </p>
                  </div>
                </div>
              </Field>
            </div>

            <Field label="Clinic code">
              <ReadOnly
                icon={Hash}
                value={clinicCode}
              />
            </Field>

            <Field label="Time zone">
              <ReadOnly
                icon={Globe}
                value="Asia/Kolkata (IST, UTC+5:30)"
              />
            </Field>

            <Field label="Appointment slot duration">
              <ReadOnly
                icon={Timer}
                value={
                  slotDuration
                    ? `${slotDuration} minutes`
                    : "Not configured"
                }
              />
            </Field>

          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3 text-xs text-slate-500">
            <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
            Clinic code and time zone are system-assigned and cannot be changed. Slot duration is set per doctor in the Schedule page.
          </div>
        </div>


        {/* ─── Action buttons ───────────────────────────── */}
        <div className="flex items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <button
            type="button"
            onClick={discard}
            disabled={saving}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
          >
            {saving && (
              <Loader2 size={15} className="animate-spin" />
            )}
            Save changes
          </button>
        </div>

      </form>

    </Layout>
  );
}
