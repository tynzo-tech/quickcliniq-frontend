import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";


export default function AdminLogin() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (localStorage.getItem("admin_logged_in")) {

      navigate("/admin/whatsapp", { replace: true });
    }

  }, [navigate]);

  async function handleSubmit(event) {

    event.preventDefault();
    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        apiUrl("/admin/login"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("admin_logged_in", "true");
      localStorage.setItem("admin", JSON.stringify(data.admin));
      navigate("/admin/whatsapp", { replace: true });

    } catch {

      setError("Could not connect to server");

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            QuickCliniq
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Admin login
          </h1>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Username
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50">
              <UserRound size={15} className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Password
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50">
              <LockKeyhole size={15} className="shrink-0 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
