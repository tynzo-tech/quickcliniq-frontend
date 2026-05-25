import {
  useCallback,
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  Loader2,
  Moon,
  Plus,
  Save,
  Sun
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
    doctor_name: "",
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
    slot_duration: 10
  };
}


export default function Profile() {

  const clinicId =
    localStorage.getItem(
      "clinic_id"
    );

  const [clinic, setClinic] =
    useState({
      clinic_id: Number(clinicId),
      name: "",
      doctor_name: "",
      specialization: "",
      timings: "",
      address: "",
      phone_number: ""
    });

  const [doctors, setDoctors] =
    useState([]);

  const [doctorForm, setDoctorForm] =
    useState(() =>
      emptyDoctorForm(
        clinicId
      )
    );

  const [passwordForm, setPasswordForm] =
    useState({
      current_password: "",
      new_password: "",
      confirm_password: ""
    });

  const [theme, setTheme] =
    useState(
      localStorage.getItem("theme") || "light"
    );

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  const loadProfile =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await axios.get(
            apiUrl(`/clinic-profile/${clinicId}`)
          );

        setClinic({
          clinic_id: Number(clinicId),
          ...response.data.clinic
        });

        setDoctors(
          response.data.doctors || []
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to load profile"
        );

      } finally {

        setLoading(false);
      }
    }, [clinicId]);


  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        loadProfile();

      }, 0);

    return () =>
      window.clearTimeout(
        timer
      );

  }, [loadProfile]);


  const showMessage = (
    nextMessage
  ) => {

    setMessage(nextMessage);
    setError("");
  };


  const showError = (
    nextError
  ) => {

    setError(nextError);
    setMessage("");
  };


  const updateClinic =
    (field, value) => {

      setClinic((current) => ({
        ...current,
        [field]: value
      }));
    };


  const updatePassword =
    (field, value) => {

      setPasswordForm((current) => ({
        ...current,
        [field]: value
      }));
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


  const saveProfile =
    async (event) => {

      event.preventDefault();

      try {

        setSaving(true);

        const response =
          await axios.put(
            apiUrl("/clinic-profile"),
            clinic
          );

        localStorage.setItem(
          "clinic",
          JSON.stringify(
            response.data.clinic
          )
        );

        showMessage(
          "Profile updated."
        );

      } catch (error) {

        console.log(error);

        showError(
          error.response?.data?.detail ||
            "Failed to update profile"
        );

      } finally {

        setSaving(false);
      }
    };


  const changePassword =
    async (event) => {

      event.preventDefault();

      if (passwordForm.new_password !== passwordForm.confirm_password) {

        showError(
          "New passwords do not match."
        );

        return;
      }

      try {

        setSaving(true);

        await axios.post(
          apiUrl("/change-password"),
          {
            clinic_id: Number(clinicId),
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password
          }
        );

        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });

        showMessage(
          "Password changed."
        );

      } catch (error) {

        console.log(error);

        showError(
          error.response?.data?.detail ||
            "Failed to change password"
        );

      } finally {

        setSaving(false);
      }
    };


  const addDoctor =
    async (event) => {

      event.preventDefault();

      try {

        setSaving(true);

        await axios.post(
          apiUrl("/doctors"),
          {
            ...doctorForm,
            break_start: doctorForm.break_start || null,
            break_end: doctorForm.break_end || null,
            slot_duration: Number(
              doctorForm.slot_duration
            )
          }
        );

        setDoctorForm(
          emptyDoctorForm(
            clinicId
          )
        );

        await loadProfile();

        showMessage(
          "Doctor added."
        );

      } catch (error) {

        console.log(error);

        showError(
          error.response?.data?.detail ||
            "Failed to add doctor"
        );

      } finally {

        setSaving(false);
      }
    };


  const changeTheme =
    (nextTheme) => {

      localStorage.setItem(
        "theme",
        nextTheme
      );

      setTheme(
        nextTheme
      );

      window.location.reload();
    };


  if (loading) {

    return (
      <Layout>
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
          Loading profile...
        </div>
      </Layout>
    );
  }


  return (
    <Layout
      title="Profile"
      subtitle="Manage clinic profile, password, doctors, and workspace theme."
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

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={saveProfile}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            Clinic details
          </h2>

          <div className="mt-5 grid gap-3">
            {[
              ["name", "Clinic name"],
              ["doctor_name", "Primary doctor"],
              ["specialization", "Specialization"],
              ["timings", "Timings"],
              ["address", "Address"],
              ["phone_number", "Phone number"]
            ].map(([field, label]) => (
              <label
                key={field}
                className="block"
              >
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
                <input
                  type="text"
                  value={clinic[field] || ""}
                  onChange={(event) =>
                    updateClinic(
                      field,
                      event.target.value
                    )
                  }
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            <Save size={16} />
            Save profile
          </button>
        </form>

        <div className="space-y-6">
          <form
            onSubmit={changePassword}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-950">
              Change password
            </h2>

            <div className="mt-5 grid gap-3">
              {[
                ["current_password", "Current password"],
                ["new_password", "New password"],
                ["confirm_password", "Confirm new password"]
              ].map(([field, label]) => (
                <label
                  key={field}
                  className="block"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>
                  <input
                    type="password"
                    value={passwordForm[field]}
                    onChange={(event) =>
                      updatePassword(
                        field,
                        event.target.value
                      )
                    }
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <Save size={16} />
              Change password
            </button>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Theme
            </h2>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => changeTheme("light")}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                  theme === "light"
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <Sun size={16} />
                White
              </button>
              <button
                type="button"
                onClick={() => changeTheme("dark")}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                  theme === "dark"
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Doctors
            </h2>
            <div className="mt-3 space-y-2">
              {doctors.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No doctors configured.
                </p>
              ) : doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <span className="font-semibold text-slate-950">
                    {doctor.doctor_name}
                  </span>
                  {" "}
                  {doctor.working_days} · {doctor.start_time}-{doctor.end_time}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={addDoctor}
            className="w-full max-w-2xl rounded-lg border border-slate-200 p-4"
          >
            <h3 className="text-sm font-semibold text-slate-950">
              Add doctor
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Doctor name"
                value={doctorForm.doctor_name}
                onChange={(event) =>
                  updateDoctor(
                    "doctor_name",
                    event.target.value
                  )
                }
                className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:col-span-2"
                required
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
                value={doctorForm.slot_duration}
                onChange={(event) =>
                  updateDoctor(
                    "slot_duration",
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

            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
            >
              <Plus size={16} />
              Add doctor
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
