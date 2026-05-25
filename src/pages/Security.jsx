import {
  useState
} from "react";

import axios from "axios";

import {
  Loader2,
  Save,
  ShieldCheck
} from "lucide-react";

import Layout from "../components/Layout";

import {
  apiUrl
} from "../config/api";


export default function Security() {

  const clinicId =
    localStorage.getItem(
      "clinic_id"
    );

  const [passwordForm, setPasswordForm] =
    useState({
      current_password: "",
      new_password: "",
      confirm_password: ""
    });

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  const updatePassword =
    (field, value) => {

      setPasswordForm((current) => ({
        ...current,
        [field]: value
      }));
    };


  const changePassword =
    async (event) => {

      event.preventDefault();

      if (passwordForm.new_password !== passwordForm.confirm_password) {

        setError(
          "New passwords do not match."
        );
        setMessage("");

        return;
      }

      try {

        setSaving(true);
        setError("");
        setMessage("");

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

        setMessage(
          "Password changed."
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to change password"
        );

      } finally {

        setSaving(false);
      }
    };


  return (
    <Layout
      title="Security"
      subtitle="Manage password and account security."
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
        onSubmit={changePassword}
        className="max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <ShieldCheck size={21} />
          </div>
          <h2 className="text-lg font-semibold text-slate-950">
            Change password
          </h2>
        </div>

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
                required
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
          Change password
        </button>
      </form>
    </Layout>
  );
}
