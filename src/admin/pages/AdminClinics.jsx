import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Building2,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  X
} from "lucide-react";

import AdminLayout from "../AdminLayout";
import { apiUrl } from "../../config/api";
import { adminHeaders } from "../adminFetch";


const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50";


function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}


const EMPTY_FORM = {
  name: "",
  doctor_name: "",
  specialization: "",
  phone_number: "",
  username: "",
  password: "",
  timings: "",
  address: ""
};


export default function AdminClinics() {

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Set password modal
  const [pwModal, setPwModal] = useState(null); // { clinic }
  const [newPassword, setNewPassword] = useState("");
  const [mustChange, setMustChange] = useState(true);
  const [settingPw, setSettingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");


  const load = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const res = await fetch(
        apiUrl("/admin/clinics"),
        { headers: adminHeaders() }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to load");

      setClinics(Array.isArray(data) ? data : []);

    } catch (e) {

      setError(e.message);

    } finally {

      setLoading(false);
    }

  }, []);


  useEffect(() => { load(); }, [load]);


  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }


  function openEdit(clinic) {
    setEditingId(clinic.id);
    setForm({
      name: clinic.name || "",
      doctor_name: clinic.doctor_name || "",
      specialization: clinic.specialization || "",
      phone_number: clinic.phone_number || "",
      username: clinic.username || "",
      password: "",
      timings: clinic.timings || "",
      address: clinic.address || ""
    });
    setFormError("");
    setModalOpen(true);
  }


  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }


  async function saveClinic(event) {

    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {

      const isEdit = Boolean(editingId);

      const payload = isEdit
        ? {
            name: form.name.trim() || undefined,
            doctor_name: form.doctor_name.trim() || undefined,
            specialization: form.specialization.trim() || undefined,
            phone_number: form.phone_number.trim() || undefined,
            username: form.username.trim() || undefined,
            timings: form.timings.trim() || undefined,
            address: form.address.trim() || undefined
          }
        : {
            name: form.name.trim(),
            doctor_name: form.doctor_name.trim(),
            specialization: form.specialization.trim(),
            phone_number: form.phone_number.trim(),
            username: form.username.trim() || null,
            password: form.password,
            timings: form.timings.trim(),
            address: form.address.trim()
          };

      const url = isEdit
        ? apiUrl(`/admin/clinics/${editingId}`)
        : apiUrl("/admin/clinics");

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.detail || "Save failed");
        return;
      }

      closeModal();
      await load();

    } catch (e) {

      setFormError(e.message);

    } finally {

      setSaving(false);
    }
  }


  function openSetPassword(clinic) {
    setPwModal({ clinic });
    setNewPassword("");
    setMustChange(true);
    setPwError("");
    setPwSuccess("");
  }


  function closePwModal() {
    setPwModal(null);
    setPwError("");
    setPwSuccess("");
  }


  async function submitPassword(event) {

    event.preventDefault();
    setSettingPw(true);
    setPwError("");
    setPwSuccess("");

    try {

      const res = await fetch(
        apiUrl(`/admin/clinics/${pwModal.clinic.id}/set-password`),
        {
          method: "POST",
          headers: adminHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            password: newPassword,
            password_must_change: mustChange
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setPwError(data.detail || "Failed to set password");
        return;
      }

      setPwSuccess("Password updated.");
      setNewPassword("");

    } catch (e) {

      setPwError(e.message);

    } finally {

      setSettingPw(false);
    }
  }


  return (
    <AdminLayout
      title="Clinic Accounts"
      subtitle="Create and manage clinic logins. Set passwords here — no hardcoded credentials in source code."
    >

      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {!error && <div />}
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={14} />
            Add clinic
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-slate-500">
            <Loader2 size={18} className="mr-2 animate-spin text-teal-600" />
            Loading…
          </div>
        ) : clinics.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Building2 size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No clinics yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Click "Add clinic" to create the first account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Clinic</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Username</th>
                  <th className="px-5 py-3 font-semibold">Password</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                          <Building2 size={14} />
                        </div>
                        <span className="font-medium text-slate-950">
                          {clinic.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {clinic.doctor_name || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {clinic.phone_number || "—"}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {clinic.username ? (
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {clinic.username}
                        </code>
                      ) : (
                        <span className="text-slate-400 text-xs">derived from name</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {clinic.has_password ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                          <KeyRound size={12} />
                          {clinic.password_must_change ? "Must change" : "Set"}
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(clinic)}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openSetPassword(clinic)}
                          title="Set password"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <KeyRound size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* ── Add / Edit modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                {editingId ? "Edit clinic" : "Add clinic"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveClinic} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

              {formError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">

                <Field label="Clinic name *">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Sandhya Clinic"
                    className={inputClass}
                    required={!editingId}
                  />
                </Field>

                <Field label="Doctor name *">
                  <input
                    type="text"
                    value={form.doctor_name}
                    onChange={(e) => setForm((f) => ({ ...f, doctor_name: e.target.value }))}
                    placeholder="Dr. Sandhya"
                    className={inputClass}
                    required={!editingId}
                  />
                </Field>

                <Field label="Specialization">
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                    placeholder="Dermatology"
                    className={inputClass}
                  />
                </Field>

                <Field label="Phone number *">
                  <input
                    type="text"
                    value={form.phone_number}
                    onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                    placeholder="+917093638421"
                    className={inputClass}
                    required={!editingId}
                  />
                </Field>

                <Field label="Username (for login)">
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="sandhya"
                    className={inputClass}
                  />
                </Field>

                {!editingId && (
                  <Field label="Initial password *">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      className={inputClass}
                      required
                      minLength={6}
                    />
                  </Field>
                )}

                <Field label="Timings">
                  <input
                    type="text"
                    value={form.timings}
                    onChange={(e) => setForm((f) => ({ ...f, timings: e.target.value }))}
                    placeholder="9 AM – 6 PM"
                    className={inputClass}
                  />
                </Field>

                <Field label="Address">
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Bangalore"
                    className={inputClass}
                  />
                </Field>

              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create clinic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── Set password modal ── */}
      {pwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40" onClick={closePwModal} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Set password
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {pwModal.clinic.name}
                </p>
              </div>
              <button
                type="button"
                onClick={closePwModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitPassword} className="p-6 space-y-4">

              {pwError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {pwError}
                </div>
              )}

              {pwSuccess && (
                <div className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-2.5 text-sm text-teal-700">
                  {pwSuccess}
                </div>
              )}

              <Field label="New password">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className={inputClass}
                  required
                  minLength={6}
                />
              </Field>

              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mustChange}
                  onChange={(e) => setMustChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                />
                Require clinic to change on next login
              </label>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closePwModal}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={settingPw}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {settingPw && <Loader2 size={14} className="animate-spin" />}
                  {settingPw ? "Saving…" : "Set password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
