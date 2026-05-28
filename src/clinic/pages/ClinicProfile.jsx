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
  Loader2,
  Pencil,
  Phone,
  Timer
} from "lucide-react";

import Layout from "../../components/Layout";

import { apiUrl } from "../../config/api";


const SPECIALIZATIONS = [
  "General Medicine",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Cardiology",
  "Neurology",
  "ENT",
  "Ophthalmology",
  "Dentistry",
  "Psychiatry",
  "Urology",
  "Gastroenterology",
  "Endocrinology",
  "Pulmonology",
  "Other"
];


function Label({ children }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-slate-500">
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", required, icon: Icon, rightIcon: RightIcon }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
      {Icon && <Icon size={15} className="shrink-0 text-slate-400" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="min-h-10 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {RightIcon && <RightIcon size={15} className="shrink-0 text-slate-400" />}
    </div>
  );
}

function ReadOnlyInput({ value, placeholder = "—", icon: Icon }) {
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
      {Icon && <Icon size={15} className="shrink-0 text-slate-400" />}
      <span className="text-sm text-slate-600">{value || placeholder}</span>
    </div>
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
    window.setTimeout(() => setToast({ msg: "", error: false }), 3500);
  };


  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(apiUrl(`/clinic-profile/${clinicId}`));
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

      const primaryDoctor = doctors?.find((d) => !d.is_deleted);
      setSlotDuration(primaryDoctor?.consultation_duration || null);

    } catch (e) {
      showToast(e.response?.data?.detail || "Failed to load profile", true);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);


  useEffect(() => {
    const t = window.setTimeout(loadProfile, 0);
    return () => window.clearTimeout(t);
  }, [loadProfile]);


  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const discard = () => setForm(savedForm);


  const save = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const res = await axios.put(apiUrl("/clinic-profile"), form);

      localStorage.setItem("clinic", JSON.stringify(res.data.clinic));

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
      showToast(e.response?.data?.detail || "Failed to save profile", true);
    } finally {
      setSaving(false);
    }
  };


  const clinicInitials = (form.name || "QC")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const clinicCode = `QC-${(form.name || "").replace(/\s+/g, "").slice(0, 3).toUpperCase() || "CLI"}-${String(clinicId || 0).padStart(2, "0")}`;


  if (loading) {
    return (
      <Layout
        title="Clinic Profile"
        subtitle="Manage clinic identity, contact details, and operating information."
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
      subtitle="Manage clinic identity, contact details, and operating information."
      actions={
        <>
          <button
            type="button"
            onClick={discard}
            disabled={saving}
            className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Discard
          </button>
          <button
            type="submit"
            form="clinic-profile-form"
            disabled={saving}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </>
      }
    >

      {toast.msg && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
          toast.error
            ? "border-red-100 bg-red-50 text-red-700"
            : "border-teal-100 bg-teal-50 text-teal-700"
        }`}>
          {toast.msg}
        </div>
      )}

      <form id="clinic-profile-form" onSubmit={save}>
        <div className="grid gap-4 lg:grid-cols-2">

          {/* ── Left: Clinic details ── */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                <Building2 size={16} className="text-teal-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-950">Clinic details</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <Label>Clinic name</Label>
                <TextInput
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Sandhya Clinic"
                  required
                />
              </div>

              <div>
                <Label>Primary doctor</Label>
                <TextInput
                  value={form.doctor_name}
                  onChange={(e) => update("doctor_name", e.target.value)}
                  placeholder="e.g. Dr. Sandhya"
                  required
                />
              </div>

              <div>
                <Label>Specialization</Label>
                <select
                  value={form.specialization}
                  onChange={(e) => update("specialization", e.target.value)}
                  className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Consultation hours</Label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                  <input
                    type="text"
                    value={form.timings}
                    onChange={(e) => update("timings", e.target.value)}
                    placeholder="e.g. 9:00 AM – 6:00 PM"
                    className="min-h-10 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <Clock size={15} className="shrink-0 text-slate-400" />
                </div>
              </div>

              <div>
                <Label>Clinic phone</Label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                  <Phone size={15} className="shrink-0 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => update("phone_number", e.target.value)}
                    placeholder="+91 9876543210"
                    required
                    className="min-h-10 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <Label>WhatsApp number</Label>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                  <Phone size={15} className="shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-600">{whatsappNumber || "Not configured"}</span>
                </div>
              </div>

              <div className="col-span-2">
                <Label>Address</Label>
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Street, building, landmark..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
                />
              </div>

              <div className="col-span-2">
                <Label>City / Area</Label>
                <TextInput
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Hyderabad, Telangana"
                />
              </div>

            </div>
          </div>


          {/* ── Right: Clinic identity ── */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <Hash size={16} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Clinic identity</h2>
                <p className="text-xs text-slate-400">Visible in patient-facing communication.</p>
              </div>
            </div>

            {/* Avatar + upload */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white select-none">
                  {clinicInitials}
                </div>
                <div className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-700 shadow-sm">
                  <Pencil size={10} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 opacity-60 cursor-not-allowed"
                >
                  <Camera size={14} />
                  Change logo
                </button>
                <p className="mt-1 text-xs text-slate-400">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div className="space-y-4">

              <div>
                <Label>Clinic code</Label>
                <ReadOnlyInput icon={Hash} value={clinicCode} />
              </div>

              <div>
                <Label>Time zone</Label>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                  <Globe size={15} className="shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-600">IST (Asia/Kolkata)</span>
                </div>
              </div>

              <div>
                <Label>Appointment slot duration</Label>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                  <Timer size={15} className="shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {slotDuration ? `${slotDuration} min` : "Not configured"}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </form>

    </Layout>
  );
}
