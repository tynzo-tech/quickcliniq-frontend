import {
  useState
} from "react";

import {
  Moon,
  Palette,
  Sun
} from "lucide-react";

import Layout from "../components/Layout";


export default function Appearance() {

  const [theme, setTheme] =
    useState(
      localStorage.getItem("theme") || "light"
    );


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


  return (
    <Layout
      title="Appearance"
      subtitle="Choose the workspace theme."
    >
      <section className="max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Palette size={21} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Theme
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick how the dashboard should look on this device.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => changeTheme("light")}
            className={`flex min-h-24 items-center justify-between rounded-lg border p-4 text-left transition ${
              theme === "light"
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold">
                White
              </span>
              <span className={`mt-1 block text-xs ${
                theme === "light"
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
            onClick={() => changeTheme("dark")}
            className={`flex min-h-24 items-center justify-between rounded-lg border p-4 text-left transition ${
              theme === "dark"
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold">
                Dark
              </span>
              <span className={`mt-1 block text-xs ${
                theme === "dark"
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
