import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  MessageCircle,
  Save
} from "lucide-react";

import AdminLayout from "../AdminLayout";
import { apiUrl } from "../../config/api";


const FIELD_GROUPS = [
  {
    title: "Meta app",
    fields: [
      { key: "META_APP_ID", label: "Meta App ID" },
      { key: "META_APP_SECRET", label: "Meta App Secret", secret: true }
    ]
  },
  {
    title: "WhatsApp Cloud API",
    fields: [
      { key: "WHATSAPP_TOKEN", label: "Access Token", secret: true },
      { key: "PHONE_NUMBER_ID", label: "Phone Number ID" },
      { key: "VERIFY_TOKEN", label: "Webhook Verify Token" }
    ]
  },
  {
    title: "Application URLs",
    fields: [
      { key: "BACKEND_URL", label: "Backend URL" },
      { key: "FRONTEND_URL", label: "Frontend Redirect URL" }
    ]
  },
  {
    title: "Conversation",
    fields: [
      { key: "CONVERSATION_TIMEOUT_MINUTES", label: "Conversation Timeout" },
      { key: "APP_TIMEZONE", label: "Timezone" }
    ]
  }
];


function isMaskedValue(value) {
  return typeof value === "string" && value.includes("...");
}


export default function AdminMetaSettings() {

  const [form, setForm] = useState({});
  const [masked, setMasked] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const callbackUrl = useMemo(() => {
    const base = (form.BACKEND_URL || "").replace(/\/+$/, "");
    return base ? `${base}/auth/callback` : "";
  }, [form.BACKEND_URL]);

  const webhookUrl = useMemo(() => {
    const base = (form.BACKEND_URL || "").replace(/\/+$/, "");
    return base ? `${base}/webhook` : "";
  }, [form.BACKEND_URL]);

  useEffect(() => {

    async function load() {

      try {

        const res = await fetch(apiUrl("/admin/meta-settings"));
        const data = await res.json();

        if (!res.ok) throw new Error(data.detail || "Unable to load");

        const settings = data.settings || {};
        setForm(settings);
        setMasked(
          Object.fromEntries(
            Object.entries(settings).filter(([, v]) => isMaskedValue(v))
          )
        );

      } catch (e) {

        setError(e.message);

      } finally {

        setLoading(false);
      }
    }

    load();
  }, []);

  function updateField(key, value) {
    setForm((cur) => ({ ...cur, [key]: value }));
    setMessage("");
    setError("");
  }

  async function save() {

    setSaving(true);
    setMessage("");
    setError("");

    const payload = {};
    FIELD_GROUPS.forEach((g) => {
      g.fields.forEach((f) => {
        const val = form[f.key];
        if (f.secret && val === masked[f.key]) return;
        payload[f.key] = val || "";
      });
    });

    try {

      const res = await fetch(
        apiUrl("/admin/meta-settings"),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Save failed");

      const settings = data.settings || {};
      setForm(settings);
      setMasked(
        Object.fromEntries(
          Object.entries(settings).filter(([, v]) => isMaskedValue(v))
        )
      );
      setMessage("Settings saved.");

    } catch (e) {

      setError(e.message);

    } finally {

      setSaving(false);
    }
  }

  async function copyText(value) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setMessage("Copied.");
  }

  return (
    <AdminLayout
      title="Meta Settings"
      subtitle="Manage WhatsApp Cloud API and Meta app values used by the backend."
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          {(message || error) && (
            <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              error
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-teal-100 bg-teal-50 text-teal-700"
            }`}>
              {error || message}
            </div>
          )}

          {FIELD_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <MessageCircle size={17} />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    {group.title}
                  </h2>
                </div>

                {group.title === "WhatsApp Cloud API" && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets((v) => !v)}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    {showSecrets ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showSecrets ? "Hide" : "Show"}
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {group.fields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {field.label}
                    </span>
                    <input
                      type={field.secret && !showSecrets ? "password" : "text"}
                      value={form[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      disabled={loading}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-teal-700" />
              <h2 className="text-sm font-semibold text-slate-950">
                Meta Console URLs
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: "Webhook Callback", value: webhookUrl },
                { label: "OAuth Callback", value: callbackUrl }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <div className="mt-2 flex items-start gap-2">
                    <p className="min-w-0 flex-1 break-all text-xs font-semibold leading-5 text-slate-800">
                      {item.value || "Set backend URL first"}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText(item.value)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-950"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            After saving, restart the backend service on EC2 if the running process does not pick up the new values immediately.
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
}
