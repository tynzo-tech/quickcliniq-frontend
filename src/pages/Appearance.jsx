import { useState } from "react";

import { Check, Moon, Palette, Sun, Monitor } from "lucide-react";

import Layout from "../components/Layout";


const THEMES = [
  {
    id: "light",
    label: "Light",
    desc: "Clean white workspace, best for bright rooms.",
    icon: Sun,
    preview: {
      bg: "bg-white",
      sidebar: "bg-slate-50 border-slate-200",
      card: "bg-white border-slate-200",
      text: "text-slate-950",
      sub: "text-slate-400"
    }
  },
  {
    id: "dark",
    label: "Dark",
    desc: "Reduced glare, easier on the eyes at night.",
    icon: Moon,
    preview: {
      bg: "bg-slate-900",
      sidebar: "bg-slate-800 border-slate-700",
      card: "bg-slate-800 border-slate-700",
      text: "text-white",
      sub: "text-slate-400"
    }
  }
];


export default function Appearance() {

  const [savedTheme, setSavedTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [selected, setSelected] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [toast, setToast] = useState("");
  const unsaved = selected !== savedTheme;

  const save = () => {
    localStorage.setItem("theme", selected);
    setSavedTheme(selected);
    window.dispatchEvent(
      new CustomEvent("quickcliniq-theme-change", { detail: { theme: selected } })
    );
    setToast("Theme saved.");
    window.setTimeout(() => setToast(""), 3000);
  };


  return (
    <Layout
      title="Appearance"
      subtitle="Choose how the dashboard looks on this device."
      actions={
        <button
          type="button"
          onClick={save}
          disabled={!unsaved}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save changes
        </button>
      }
    >

      {toast && (
        <div className="mb-4 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          {toast}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <Palette size={16} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Theme</h2>
            <p className="text-xs text-slate-400">Applies to this device only.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {THEMES.map(({ id, label, desc, icon: Icon, preview }) => {
            const active = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={`relative rounded-xl border-2 p-4 text-left transition ${
                  active
                    ? "border-teal-600 shadow-md shadow-teal-600/10"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Checkmark */}
                {active && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Mini preview */}
                <div className={`mb-4 overflow-hidden rounded-lg border ${preview.card} h-20 flex`}>
                  <div className={`w-10 shrink-0 border-r ${preview.sidebar}`} />
                  <div className={`flex-1 ${preview.bg} p-2 space-y-1.5`}>
                    <div className={`h-2 w-3/4 rounded ${active ? "bg-teal-500/30" : "bg-slate-200"}`} />
                    <div className={`h-2 w-1/2 rounded ${active ? "bg-teal-500/20" : "bg-slate-100"}`} />
                    <div className={`h-2 w-2/3 rounded ${active ? "bg-teal-500/20" : "bg-slate-100"}`} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Icon size={15} className={active ? "text-teal-600" : "text-slate-400"} />
                  <p className="text-sm font-semibold text-slate-950">{label}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{desc}</p>
              </button>
            );
          })}
        </div>

        {unsaved && (
          <p className="mt-4 text-xs text-amber-600">
            You have unsaved changes — click Save changes to apply.
          </p>
        )}

      </div>

    </Layout>
  );
}
