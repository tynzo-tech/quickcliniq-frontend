import {
  useCallback,
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  Loader2,
  Save
} from "lucide-react";

import Layout from "../components/Layout";

import {
  apiUrl
} from "../config/api";


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


  const updateClinic =
    (field, value) => {

      setClinic((current) => ({
        ...current,
        [field]: value
      }));
    };


  const saveProfile =
    async (event) => {

      event.preventDefault();

      try {

        setSaving(true);
        setError("");
        setMessage("");

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

        setMessage(
          "Profile updated."
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to update profile"
        );

      } finally {

        setSaving(false);
      }
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
      subtitle="Manage clinic profile details."
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

      <form
        onSubmit={saveProfile}
        className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-950">
          Clinic details
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
              className={field === "address" ? "block sm:col-span-2" : "block"}
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
          {saving ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}
          Save profile
        </button>
      </form>
    </Layout>
  );
}
