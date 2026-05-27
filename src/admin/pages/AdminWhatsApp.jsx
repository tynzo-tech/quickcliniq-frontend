import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Send,
  X
} from "lucide-react";

import AdminLayout from "../AdminLayout";
import { apiUrl } from "../../config/api";


const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50";


function Field({ label, children }) {

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="mt-1.5">
        {children}
      </div>
    </label>
  );
}


function StatusBadge({ active }) {

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      active
        ? "bg-teal-50 text-teal-700"
        : "bg-slate-100 text-slate-500"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-teal-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}


const EMPTY_FORM = {
  phone_number_id: "",
  display_phone_number: "",
  business_account_id: "",
  access_token: "",
  clinic_id: ""
};


export default function AdminWhatsApp() {

  const [numbers, setNumbers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Test modal
  const [testModal, setTestModal] = useState(null); // { number }
  const [testTo, setTestTo] = useState("");
  const [testMessage, setTestMessage] = useState(
    "Test message from QuickCliniq admin. Your WhatsApp integration is working."
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Toggle in-progress
  const [togglingId, setTogglingId] = useState(null);


  const load = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const [numRes, cliRes] = await Promise.all([
        fetch(apiUrl("/admin/whatsapp-numbers")),
        fetch(apiUrl("/admin/clinics"))
      ]);

      const numData = await numRes.json();
      const cliData = await cliRes.json();

      if (!numRes.ok) throw new Error(numData.detail || "Failed to load numbers");

      setNumbers(Array.isArray(numData) ? numData : []);
      setClinics(Array.isArray(cliData) ? cliData : []);

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
    setShowToken(false);
    setFormError("");
    setModalOpen(true);
  }


  function openEdit(number) {
    setEditingId(number.id);
    setForm({
      phone_number_id: number.phone_number_id || "",
      display_phone_number: number.display_phone_number || "",
      business_account_id: number.business_account_id || "",
      access_token: number.access_token || "",
      clinic_id: number.clinic_id ? String(number.clinic_id) : ""
    });
    setShowToken(false);
    setFormError("");
    setModalOpen(true);
  }


  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }


  async function saveNumber(event) {

    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {

      const payload = {
        phone_number_id: form.phone_number_id.trim(),
        display_phone_number: form.display_phone_number.trim() || null,
        business_account_id: form.business_account_id.trim() || null,
        access_token: form.access_token.trim() || null,
        clinic_id: form.clinic_id ? Number(form.clinic_id) : null
      };

      const url = editingId
        ? apiUrl(`/admin/whatsapp-numbers/${editingId}`)
        : apiUrl("/admin/whatsapp-numbers");

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
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


  async function toggleActive(number) {

    setTogglingId(number.id);

    try {

      const res = await fetch(
        apiUrl(`/admin/whatsapp-numbers/${number.id}/toggle`),
        { method: "POST" }
      );

      if (!res.ok) {
        const d = await res.json();
        setError(d.detail || "Toggle failed");
        return;
      }

      setNumbers((prev) =>
        prev.map((n) =>
          n.id === number.id
            ? { ...n, is_active: !n.is_active }
            : n
        )
      );

    } catch (e) {

      setError(e.message);

    } finally {

      setTogglingId(null);
    }
  }


  function openTest(number) {
    setTestModal({ number });
    setTestTo("");
    setTestMessage(
      "Test message from QuickCliniq admin. Your WhatsApp integration is working."
    );
    setTestResult(null);
  }


  function closeTest() {
    setTestModal(null);
    setTestResult(null);
  }


  async function sendTest(event) {

    event.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {

      const res = await fetch(
        apiUrl(`/admin/whatsapp-numbers/${testModal.number.id}/test`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: testTo, message: testMessage })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setTestResult({
          ok: false,
          text: JSON.stringify(data.detail || data, null, 2)
        });
        return;
      }

      setTestResult({ ok: true, text: "Message sent successfully." });

    } catch (e) {

      setTestResult({ ok: false, text: e.message });

    } finally {

      setTesting(false);
    }
  }


  return (
    <AdminLayout
      title="WhatsApp Numbers"
      subtitle="Manage Meta phone numbers, WABA IDs, tokens and clinic mapping."
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
            Add number
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
        ) : numbers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Phone size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              No WhatsApp numbers yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Click "Add number" to register the first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Display number</th>
                  <th className="px-5 py-3 font-semibold">Phone Number ID</th>
                  <th className="px-5 py-3 font-semibold">WABA ID</th>
                  <th className="px-5 py-3 font-semibold">Clinic</th>
                  <th className="px-5 py-3 font-semibold">Token</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {numbers.map((number) => (
                  <tr
                    key={number.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                          <Phone size={14} />
                        </div>
                        <span className="font-medium text-slate-950">
                          {number.display_phone_number || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {number.phone_number_id}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {number.business_account_id || "—"}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      {number.clinic_name ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building2 size={13} className="text-slate-400" />
                          {number.clinic_name}
                        </div>
                      ) : (
                        <span className="text-slate-400">Unmapped</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {number.has_token ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                          <CheckCircle size={12} />
                          Set
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Using global
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge active={number.is_active} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(number)}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openTest(number)}
                          title="Send test message"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(number)}
                          disabled={togglingId === number.id}
                          title={number.is_active ? "Deactivate" : "Activate"}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40 ${
                            number.is_active
                              ? "border-red-100 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              : "border-teal-100 text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                          }`}
                        >
                          {togglingId === number.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Power size={13} />
                          )}
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
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                {editingId ? "Edit WhatsApp number" : "Add WhatsApp number"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveNumber} className="p-6 space-y-4">

              {formError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Phone Number ID *">
                    <input
                      type="text"
                      value={form.phone_number_id}
                      onChange={(e) => setForm((f) => ({ ...f, phone_number_id: e.target.value }))}
                      placeholder="e.g. 1149201531611300"
                      className={inputClass}
                      required
                    />
                  </Field>
                </div>

                <Field label="Display phone number">
                  <input
                    type="text"
                    value={form.display_phone_number}
                    onChange={(e) => setForm((f) => ({ ...f, display_phone_number: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </Field>

                <Field label="WABA ID">
                  <input
                    type="text"
                    value={form.business_account_id}
                    onChange={(e) => setForm((f) => ({ ...f, business_account_id: e.target.value }))}
                    placeholder="WhatsApp Business Account ID"
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Access token">
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={form.access_token}
                        onChange={(e) => setForm((f) => ({ ...f, access_token: e.target.value }))}
                        placeholder={editingId ? "Leave blank to keep existing token" : "EAAxxxxx…"}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {editingId && (
                      <p className="mt-1 text-xs text-slate-400">
                        Leave blank to keep the existing token.
                      </p>
                    )}
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Map to clinic">
                    <select
                      value={form.clinic_id}
                      onChange={(e) => setForm((f) => ({ ...f, clinic_id: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— Unassigned —</option>
                      {clinics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.phone_number ? ` (${c.phone_number})` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
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
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add number"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── Test message modal ── */}
      {testModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={closeTest}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Send test message
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Using: {testModal.number.display_phone_number || testModal.number.phone_number_id}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTest}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={sendTest} className="p-6 space-y-4">

              <Field label="Send to (phone number with country code)">
                <input
                  type="text"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="919876543210"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Message">
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </Field>

              {testResult && (
                <div className={`rounded-lg border px-4 py-3 text-xs font-medium ${
                  testResult.ok
                    ? "border-teal-100 bg-teal-50 text-teal-800"
                    : "border-red-100 bg-red-50 text-red-700"
                }`}>
                  {testResult.ok ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle size={13} />
                      {testResult.text}
                    </span>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all font-mono text-[11px]">
                      {testResult.text}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeTest}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {testing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {testing ? "Sending…" : "Send test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
