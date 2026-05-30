import { useEffect, useState } from "react";

import {
  CalendarCheck,
  Eye,
  EyeOff,
  Gauge,
  Loader2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRound
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { apiUrl } from "../config/api";

import logo from "../assets/logo.png";


const FEATURES = [
  {
    icon: MessageCircle,
    title: "24/7 WhatsApp intake",
    desc: "Receive patient messages anytime."
  },
  {
    icon: CalendarCheck,
    title: "Live slot visibility",
    desc: "See real-time availability and bookings."
  },
  {
    icon: ShieldCheck,
    title: "Secure & private",
    desc: "Your clinic data is always protected."
  },
  {
    icon: Gauge,
    title: "Fast & efficient",
    desc: "Save time and manage everything easily."
  }
];


export default function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);


  useEffect(() => {
    if (localStorage.getItem("is_logged_in")) navigate("/dashboard");
  }, [navigate]);


  const showMsg = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };


  const parseResponse = async (res) => {
    try { return await res.json(); }
    catch { return {}; }
  };


  const handleLogin = async (e) => {
    e.preventDefault();

    const u = username.trim();
    const p = password.trim();

    if (!u) { showMsg("Enter your username.", "error"); return; }
    if (!p) { showMsg("Enter your password.", "error"); return; }

    setLoading(true);
    showMsg("");

    try {

      const res = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
      });

      const data = await parseResponse(res);

      if (!res.ok || !data.success) {
        showMsg(data.detail || data.message || "Login failed.", "error");
        return;
      }

      if (data.password_must_change) {
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("clinic");
        localStorage.setItem("pending_password_clinic", JSON.stringify(data.clinic));
        showMsg(data.message || "Please change your password to continue.", "info");
        setTimeout(() => navigate("/change-password"), 300);
        return;
      }

      localStorage.setItem("login_identifier", u);

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      if (data.clinic_phone_number) {
        localStorage.setItem("phone_number", data.clinic_phone_number);
      }

      const clinic = data.clinic || {
        id: data.clinic_id,
        name: data.clinic_name,
        phone_number: data.clinic_phone_number
      };

      localStorage.setItem("clinic", JSON.stringify(clinic));
      localStorage.setItem("clinic_id", clinic.id || data.clinic_id);
      localStorage.setItem("is_logged_in", "true");

      showMsg("Login successful.", "success");
      setTimeout(() => navigate("/dashboard"), 400);

    } catch {

      showMsg("Could not connect to the server.", "error");

    } finally {

      setLoading(false);
    }
  };


  const handleForgotPassword = async () => {

    const u = username.trim();

    if (!u) { showMsg("Enter your username first.", "error"); return; }

    setForgotLoading(true);
    showMsg("");

    try {

      const res = await fetch(apiUrl("/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u })
      });

      const data = await parseResponse(res);

      if (!res.ok || !data.success) {
        showMsg(data.detail || data.message || "Could not send password help.", "error");
        return;
      }

      showMsg(data.message || "Password help sent on WhatsApp.", "success");

    } catch {

      showMsg("Could not connect to the server.", "error");

    } finally {

      setForgotLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-teal-50 px-12 py-12 lg:flex lg:w-[55%]">

        {/* Decorative dot grid */}
        <svg
          className="absolute right-8 top-6 opacity-30"
          width="160"
          height="80"
          viewBox="0 0 160 80"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 16 + 8}
                cy={row * 13 + 6}
                r="2"
                fill="#0d9488"
              />
            ))
          )}
        </svg>

        {/* Content */}
        <div className="relative z-10 max-w-lg">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-1.5 text-sm font-semibold text-teal-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Clinic operations dashboard
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-[2.6rem] font-bold leading-tight tracking-tight text-slate-900">
            A focused workspace<br />
            for modern clinic<br />
            teams.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base leading-7 text-slate-600">
            Manage schedules, patients, and appointment follow-ups
            from a calm, minimal dashboard built for everyday hospital workflows.
          </p>

          {/* Feature cards */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
                  <Icon size={18} className="text-teal-600" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decoration — subtle large circle */}
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-200/30"
          aria-hidden="true"
        />
      </div>


      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 sm:px-10">

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md"
        >

          {/* Logo + brand */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 shadow-sm">
              <img
                src={logo}
                alt="QuickCliniq"
                className="h-10 w-10 rounded-xl object-contain"
              />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-slate-950">
                QuickCliniq
              </p>
              <p className="text-sm text-slate-500">
                Doctor workspace
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-7">
            <h2 className="text-2xl font-bold text-slate-950">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">
              Access your clinic schedule and appointments.
            </p>
          </div>

          {/* Username */}
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Username
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
              <UserRound size={17} className="shrink-0 text-slate-400" />
              <input
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Use the clinic username shared with you.
            </p>
          </div>

          {/* Password */}
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
              <LockKeyhole size={17} className="shrink-0 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 bg-white transition peer-checked:border-teal-600 peer-checked:bg-teal-600">
                  {rememberMe && (
                    <svg
                      width="11"
                      height="9"
                      viewBox="0 0 11 9"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4L4 7L10 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              Remember me
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="text-sm font-semibold text-teal-600 transition hover:text-teal-700 disabled:opacity-60"
            >
              {forgotLoading ? "Sending..." : "Forgot password?"}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              messageType === "error"
                ? "bg-red-50 text-red-700"
                : messageType === "success"
                  ? "bg-teal-50 text-teal-700"
                  : "bg-slate-50 text-slate-700"
            }`}>
              {message}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <LockKeyhole size={17} />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Footer trust line */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={13} className="text-slate-300" />
            <span>Secure</span>
            <span>•</span>
            <span>Private</span>
            <span>•</span>
            <span>Reliable</span>
          </div>

        </form>
      </div>

    </div>
  );
}
