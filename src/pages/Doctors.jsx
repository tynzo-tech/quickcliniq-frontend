import {
  useCallback,
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";

import Layout from "../components/Layout";

import {
  apiUrl
} from "../config/api";


const weekDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun"
];


function emptyDoctorForm(clinicId) {

  return {
    clinic_id: Number(clinicId),
    name: "",
    specialization: "",
    phone_number: "",
    email: "",
    working_days: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri"
    ],
    start_time: "09:00",
    end_time: "17:00",
    break_start: "",
    break_end: "",
    consultation_duration: 10
  };
}


export default function Doctors() {

  const clinicId =
    localStorage.getItem(
      "clinic_id"
    );

  const [doctors, setDoctors] =
    useState([]);

  const [doctorForm, setDoctorForm] =
    useState(() =>
      emptyDoctorForm(
        clinicId
      )
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [editingDoctorId, setEditingDoctorId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);


  const loadDoctors =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await axios.get(
            apiUrl("/doctors"),
            {
              params: {
                clinic_id: Number(clinicId)
              }
            }
          );

        setDoctors(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to load doctors"
        );

      } finally {

        setLoading(false);
      }
    }, [clinicId]);


  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        loadDoctors();

      }, 0);

    return () =>
      window.clearTimeout(
        timer
      );

  }, [loadDoctors]);


  const showMessage = (nextMessage) => {

    setMessage(nextMessage);
    setError("");
  };


  const showError = (nextError) => {

    setError(nextError);
    setMessage("");
  };


  const updateDoctor =
    (field, value) => {

      setDoctorForm((current) => ({
        ...current,
        [field]: value
      }));
    };


  const toggleWorkingDay =
    (day) => {

      setDoctorForm((current) => {

        const selected =
          current.working_days.includes(
            day
          );

        return {
          ...current,
          working_days: selected
            ? current.working_days.filter((item) => item !== day)
            : [
                ...current.working_days,
                day
              ]
        };
      });
    };


  const openAddDoctor = () => {

    setEditingDoctorId(null);
    setDoctorForm(
      emptyDoctorForm(
        clinicId
      )
    );
    setShowForm(true);
  };


  const startEditDoctor =
    (doctor) => {

      setEditingDoctorId(
        doctor.id
      );

      setDoctorForm({
        clinic_id: Number(clinicId),
        name: doctor.name || doctor.doctor_name || "",
        specialization: doctor.specialization || "",
        phone_number: doctor.phone_number || "",
        email: doctor.email || "",
        consultation_duration: doctor.consultation_duration || 10,
        working_days: doctor.working_days
          ? doctor.working_days.split(",").filter(Boolean)
          : [
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri"
            ],
        start_time: doctor.start_time || "09:00",
        end_time: doctor.end_time || "17:00",
        break_start: doctor.break_start || "",
        break_end: doctor.break_end || ""
      });
      setShowForm(true);
    };


  const closeForm = () => {

    setShowForm(false);
    setEditingDoctorId(null);
    setDoctorForm(
      emptyDoctorForm(
        clinicId
      )
    );
  };


  const saveDoctor =
    async (event) => {

      event.preventDefault();

      if (!doctorForm.working_days.length) {

        showError(
          "Select at least one working day."
        );

        return;
      }

      try {

        setSaving(true);

        const payload = {
          ...doctorForm,
          break_start: doctorForm.break_start || null,
          break_end: doctorForm.break_end || null,
          consultation_duration: Number(
            doctorForm.consultation_duration
          )
        };

        if (editingDoctorId) {

          await axios.put(
            apiUrl(`/doctors/${editingDoctorId}`),
            payload
          );

        } else {

          await axios.post(
            apiUrl("/doctors"),
            payload
          );
        }

        closeForm();

        await loadDoctors();

        showMessage(
          editingDoctorId
            ? "Doctor updated."
            : "Doctor added."
        );

      } catch (error) {

        console.log(error);

        showError(
          error.response?.data?.detail ||
            "Failed to save doctor"
        );

      } finally {

        setSaving(false);
      }
    };


  const deleteDoctor =
    async () => {

      if (!deleteTarget) {

        return;
      }

      try {

        setDeleting(true);

        await axios.delete(
          apiUrl(`/doctors/${deleteTarget.id}`),
          {
            params: {
              clinic_id: Number(clinicId)
            }
          }
        );

        setDeleteTarget(null);

        await loadDoctors();

        showMessage(
          "Doctor deleted."
        );

      } catch (error) {

        console.log(error);

        showError(
          error.response?.data?.detail ||
            "Failed to delete doctor"
        );

      } finally {

        setDeleting(false);
      }
    };


  return (
    <Layout
      title="Doctors"
      subtitle="Manage doctors in your clinic."
      actions={(
        <button
          type="button"
          onClick={openAddDoctor}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <Plus size={16} />
          Add Doctor
        </button>
      )}
    >
      {(message || error) && (
        <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
          error
            ? "border-red-100 bg-red-50 text-red-700"
            : "border-teal-100 bg-teal-50 text-teal-700"
        }`}>
          {error || message}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Doctors List
        </h2>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
            Loading doctors...
          </div>
        ) : doctors.length === 0 ? (
          <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            No doctors configured.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Doctor Name
                  </th>
                  <th className="px-5 py-3">
                    Specialization
                  </th>
                  <th className="px-5 py-3">
                    Phone Number
                  </th>
                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doctor, index) => (
                  <tr
                    key={doctor.id}
                    className="bg-white"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                          index % 3 === 0
                            ? "bg-teal-50 text-teal-700"
                            : index % 3 === 1
                              ? "bg-cyan-50 text-cyan-700"
                              : "bg-violet-50 text-violet-700"
                        }`}>
                          {(doctor.doctor_name || doctor.name || "D")
                            .replace(/^Dr\.?\s*/i, "")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">
                            {doctor.doctor_name || doctor.name}
                          </p>
                          {index === 0 && (
                            <p className="mt-0.5 text-xs font-medium text-slate-500">
                              Primary Doctor
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {doctor.specialization || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {doctor.phone_number || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            startEditDoctor(
                              doctor
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                          aria-label="Edit doctor"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(
                              doctor
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                          aria-label="Delete doctor"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <Info
            size={16}
            className="shrink-0 text-slate-400"
          />
          You can add multiple doctors and manage their details.
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <form
            onSubmit={saveDoctor}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-950">
                {editingDoctorId ? "Edit doctor" : "Add doctor"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Doctor name"
                value={doctorForm.name}
                onChange={(event) =>
                  updateDoctor(
                    "name",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="text"
                placeholder="Specialization"
                value={doctorForm.specialization}
                onChange={(event) =>
                  updateDoctor(
                    "specialization",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={doctorForm.phone_number}
                onChange={(event) =>
                  updateDoctor(
                    "phone_number",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="email"
                placeholder="Email"
                value={doctorForm.email}
                onChange={(event) =>
                  updateDoctor(
                    "email",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="time"
                value={doctorForm.start_time}
                onChange={(event) =>
                  updateDoctor(
                    "start_time",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="time"
                value={doctorForm.end_time}
                onChange={(event) =>
                  updateDoctor(
                    "end_time",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="number"
                min="1"
                max="240"
                value={doctorForm.consultation_duration}
                onChange={(event) =>
                  updateDoctor(
                    "consultation_duration",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                required
              />
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      toggleWorkingDay(
                        day
                      )
                    }
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                      doctorForm.working_days.includes(day)
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}
                {editingDoctorId ? "Save doctor" : "Add doctor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-950">
              Delete this doctor
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Once you delete a doctor, there is no going back. Please be certain.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteDoctor}
                disabled={deleting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}
                Delete doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
