import { useState } from "react";

import axios from "axios";

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck
} from "lucide-react";

import Layout from "../components/Layout";

import { apiUrl } from "../config/api";


function PasswordInput({ label, value, onChange, required }) {

  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-500">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          className="min-h-10 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="shrink-0 text-slate-400 transition hover:text-slate-700"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}


export default function Security() {

  const clinicId = localStorage.getItem("clinic_id");

  const empty = { current_password: "", new_password: "", confirm_password: "" };
  const [form, setForm] = useState(empty);
  const [toast, setToast] = useState({ msg: "", error: false });
  const [saving, setSaving] = useState(false);

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    window.setTimeout(() => setToast({ msg: "", error: false }), 4000);
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      showToast("New passwords do not match.", true);
      return;
    }

    if (form.new_password.length < 6) {
      showToast("New password must be at least 6 characters.", true);
      return;
    }

    try {
      setSaving(true);

      await axios.post(apiUrl("/change-password"), {
        clinic_id: Number(clinicId),
        current_password: form.current_password,
        new_password: form.new_password
      });

      setForm(empty);
      showToast("Password changed successfully.");

    } catch (e) {
      const detail = e.response?.data?.detail;
      showToast(
        typeof detail === "string" ? detail : detail?.message || "Failed to change password",
        true
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <Layout
      title="Security"
      subtitle="Manage your account password."
      actions={
        <button
          type="submit"
          form="security-form"
          disabled={saving}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save changes
        </button>
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

      <form id="security-form" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Change password */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                <KeyRound size={16} className="text-teal-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-950">Change password</h2>
            </div>

            <div className="space-y-4">
              <PasswordInput
                label="Current password"
                value={form.current_password}
                onChange={(e) => update("current_password", e.target.value)}
                required
              />
              <PasswordInput
                label="New password"
                value={form.new_password}
                onChange={(e) => update("new_password", e.target.value)}
                required
              />
              <PasswordInput
                label="Confirm new password"
                value={form.confirm_password}
                onChange={(e) => update("confirm_password", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Security tips */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <ShieldCheck size={16} className="text-violet-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-950">Password tips</h2>
            </div>

            <ul className="space-y-3">
              {[
                "Use at least 6 characters",
                "Mix letters and numbers",
                "Avoid using your clinic name or phone number",
                "Don't share your password with anyone",
                "Change your password if you suspect it was compromised"
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </form>

    </Layout>
  );
}
