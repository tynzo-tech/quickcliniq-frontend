import {
  useState
} from "react";

import {
  Moon,
  Palette,
  Save,
  Sun
} from "lucide-react";

import Layout from "../components/Layout";


export default function Appearance() {

  const [savedTheme, setSavedTheme] =
    useState(
      localStorage.getItem("theme") || "light"
    );

  const [selectedTheme, setSelectedTheme] =
    useState(
      localStorage.getItem("theme") || "light"
    );

  const [message, setMessage] =
    useState("");


  const saveThemePreference =
    () => {

      localStorage.setItem(
        "theme",
        selectedTheme
      );

      setSavedTheme(
        selectedTheme
      );

      window.dispatchEvent(
        new CustomEvent(
          "quickcliniq-theme-change",
          {
            detail: {
              theme: selectedTheme
            }
          }
        )
      );

      setMessage(
        "Theme preference saved."
      );
    };


  return (
    <Layout
      title="Appearance"
      subtitle="Choose the workspace theme."
    >
      <section className="max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Palette size={21} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Theme
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Pick how the dashboard should look on this device.
            </p>
          </div>
          </div>
          <button
            type="button"
            onClick={saveThemePreference}
            disabled={selectedTheme === savedTheme}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={14} />
            Save
          </button>
        </div>

        {message && (
          <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
            {message}
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSelectedTheme("light");
              setMessage("");
            }}
            className={`flex min-h-20 items-center justify-between rounded-lg border p-3 text-left transition ${
              selectedTheme === "light"
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold">
                White
              </span>
              <span className={`mt-1 block text-xs ${
                selectedTheme === "light"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}>
                Bright clinic workspace
              </span>
            </span>
            <Sun size={21} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTheme("dark");
              setMessage("");
            }}
            className={`flex min-h-20 items-center justify-between rounded-lg border p-3 text-left transition ${
              selectedTheme === "dark"
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold">
                Dark
              </span>
              <span className={`mt-1 block text-xs ${
                selectedTheme === "dark"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}>
                Reduced-glare workspace
              </span>
            </span>
            <Moon size={21} />
          </button>
        </div>
      </section>
    </Layout>
  );
}
