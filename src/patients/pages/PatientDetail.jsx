import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  Phone,
  UserRound,
  XCircle
} from "lucide-react";

import Layout from "../../components/Layout";
import { apiUrl } from "../../config/api";


function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  let cls = "bg-slate-100 text-slate-600";
  let label = status || "—";

  if (s.includes("book"))    { cls = "bg-amber-50 text-amber-700";  label = "Booked"; }
  else if (s.includes("complet")) { cls = "bg-teal-50 text-teal-700";   label = "Completed"; }
  else if (s.includes("cancel"))  { cls = "bg-red-50 text-red-600";     label = "Cancelled"; }
  else if (s.includes("no") && s.includes("show")) { cls = "bg-orange-50 text-orange-700"; label = "No-show"; }

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    }).format(new Date(`${value}T00:00:00`));
  } catch { return value; }
}


export default function PatientDetail() {

  const { patientId } = useParams();
  const navigate = useNavigate();
  const clinicId = localStorage.getItem("clinic_id");

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(apiUrl(`/patients/${patientId}`), {
        params: { clinic_id: clinicId }
      });
      setPatient(res.data.patient);
      setAppointments(res.data.appointments);
    } catch (e) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === "string" ? detail : detail?.message || "Failed to load patient");
    } finally {
      setLoading(false);
    }
  }, [patientId, clinicId]);


  useEffect(() => {
    const t = window.setTimeout(load, 0);
    return () => window.clearTimeout(t);
  }, [load]);


  const initials = (name) =>
    String(name || "P").split(" ").filter(Boolean).slice(0, 2)
      .map((w) => w[0]).join("").toUpperCase();

  const AVATAR_COLORS = [
    "bg-teal-100 text-teal-700", "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700", "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700", "bg-amber-100 text-amber-700"
  ];
  const avatarColor = (name) => {
    let n = 0;
    for (const c of String(name || "")) n += c.charCodeAt(0);
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
  };

  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;


  if (loading) {
    return (
      <Layout title="Patient" subtitle="Loading patient details...">
        <div className="py-20 text-center">
          <Loader2 size={24} className="mx-auto mb-3 animate-spin text-teal-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout title="Patient">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error || "Patient not found."}
        </div>
      </Layout>
    );
  }


  return (
    <Layout
      title={patient.name}
      subtitle={`Patient · ${patient.phone_number || "No phone"}`}
      actions={
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Back to patients
        </button>
      }
    >

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">

        {/* ── Left: Patient info ── */}
        <div className="space-y-4">

          {/* Profile card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${avatarColor(patient.name)}`}>
                {initials(patient.name)}
              </div>
              <h2 className="mt-3 text-base font-semibold text-slate-950">{patient.name}</h2>
              {patient.phone_number && (
                <p className="mt-1 text-sm text-slate-500">{patient.phone_number}</p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {[
                { icon: UserRound, label: "Gender", value: patient.gender || "—" },
                { icon: CalendarDays, label: "Age", value: patient.age ? `${patient.age} years` : "—" },
                { icon: Phone, label: "Phone", value: patient.phone_number || "—" },
                { icon: Clock, label: "Last visit", value: formatDate(patient.last_visit) }
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <Icon size={14} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CalendarCheck, label: "Total", value: appointments.length, color: "text-slate-600", bg: "bg-slate-50" },
              { icon: CheckCircle, label: "Done", value: completed, color: "text-teal-600", bg: "bg-teal-50" },
              { icon: XCircle, label: "Cancelled", value: cancelled, color: "text-red-500", bg: "bg-red-50" }
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-center">
                <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
                  <Icon size={15} className={color} />
                </div>
                <p className="text-xl font-bold text-slate-950">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

        </div>

        {/* ── Right: Appointment history ── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Appointment history</h2>
            <p className="mt-0.5 text-xs text-slate-400">{appointments.length} appointments on record</p>
          </div>

          {appointments.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarCheck size={28} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">No appointments yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <div key={appt.id} className="flex items-start gap-4 px-5 py-4">

                  {/* Date */}
                  <div className="w-24 shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-800">{formatDate(appt.appointment_date)}</p>
                    <p className="text-xs text-slate-400">{appt.appointment_time || ""}</p>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{appt.doctor_name || "Doctor"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {appt.problem && appt.problem !== "WhatsApp booking" ? appt.problem : "Consultation"}
                    </p>
                    {appt.follow_up_date && (
                      <p className="mt-1 text-xs text-orange-600">
                        Follow-up: {formatDate(appt.follow_up_date)}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <StatusBadge status={appt.status} />

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </Layout>
  );
}
