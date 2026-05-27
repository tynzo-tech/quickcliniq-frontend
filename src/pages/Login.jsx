import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  apiUrl
} from "../config/api";

import logo from "../assets/logo.png";


export default function Login() {

  const navigate =
    useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("info");

  const [loading, setLoading] =
    useState(false);

  const [forgotLoading, setForgotLoading] =
    useState(false);

  useEffect(() => {

    const loggedIn =
      localStorage.getItem(
        "is_logged_in"
      );

    if (loggedIn) {

      navigate("/dashboard");
    }

  }, [navigate]);


  const showFormMessage = (
    nextMessage,
    nextType = "info"
  ) => {

    setMessage(nextMessage);
    setMessageType(nextType);
  };


  const parseResponse =
  async (response) => {

    try {

      return await response.json();

    } catch {

      return {};
    }
  };


  const handleLogin =
  async (event) => {

    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {

      showFormMessage(
        "Enter your username.",
        "error"
      );

      return;
    }

    if (!trimmedPassword) {

      showFormMessage(
        "Enter your password.",
        "error"
      );

      return;
    }

    setLoading(true);
    showFormMessage("");

    try {

      const response =
        await fetch(
          apiUrl("/login"),
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              username:
                trimmedUsername,
              password:
                trimmedPassword,
            }),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {

        showFormMessage(
          data.detail ||
            data.message ||
            "Login failed.",
          "error"
        );

        return;
      }

      if (data.password_must_change) {

        localStorage.removeItem(
          "is_logged_in"
        );

        localStorage.removeItem(
          "clinic"
        );

        localStorage.setItem(
          "pending_password_clinic",
          JSON.stringify(
            data.clinic
          )
        );

        showFormMessage(
          data.message || "Please change your password to continue.",
          "info"
        );

        setTimeout(() => {

          navigate(
            "/change-password"
          );

        }, 300);

        return;
      }

      localStorage.setItem(
        "login_identifier",
        trimmedUsername
      );

      if (data.clinic_phone_number) {

        localStorage.setItem(
          "phone_number",
          data.clinic_phone_number
        );
      }

      if (data.clinic) {

        localStorage.setItem(
          "clinic",
          JSON.stringify(
            data.clinic
          )
        );

        localStorage.setItem(
          "clinic_id",
          data.clinic.id
        );

        localStorage.setItem(
          "is_logged_in",
          "true"
        );

        showFormMessage(
          "Login successful.",
          "success"
        );

        setTimeout(() => {

          navigate(
            "/dashboard"
          );

        }, 500);

        return;
      }

      localStorage.setItem(
        "clinic",
        JSON.stringify({
          id: data.clinic_id,
          name: data.clinic_name,
          phone_number: data.clinic_phone_number
        })
      );

      localStorage.setItem(
        "clinic_id",
        data.clinic_id
      );

      localStorage.setItem(
        "is_logged_in",
        "true"
      );

      showFormMessage(
        "Login successful.",
        "success"
      );

      setTimeout(() => {

        navigate(
          "/dashboard"
        );

      }, 500);

    } catch (error) {

      console.log(error);

      showFormMessage(
        "Could not connect to the server.",
        "error"
      );

    } finally {

      setLoading(false);
    }
  };


  const handleForgotPassword =
  async () => {

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {

      showFormMessage(
        "Enter your username first.",
        "error"
      );

      return;
    }

    setForgotLoading(true);
    showFormMessage("");

    try {

      const response =
        await fetch(
          apiUrl("/forgot-password"),
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              username:
                trimmedUsername,
            }),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {

        showFormMessage(
          data.detail ||
            data.message ||
            "Could not send password help.",
          "error"
        );

        return;
      }

      showFormMessage(
        data.message || "Password help sent on WhatsApp.",
        "success"
      );

    } catch (error) {

      console.log(error);

      showFormMessage(
        "Could not connect to the server.",
        "error"
      );

    } finally {

      setForgotLoading(false);
    }
  };


  return (

    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-white/80 px-3 py-2 text-sm font-semibold text-teal-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Clinic operations dashboard
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950">
              A focused workspace for modern clinic teams.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
              Manage schedules, patients, and appointment follow-ups from a calm,
              minimal dashboard built for everyday hospital workflows.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
              {[
                ["24/7", "WhatsApp intake"],
                ["Live", "Slot visibility"],
                ["Secure", "Clinic access"],
                ["Fast", "Daily workflow"]
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white/95 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 shadow-sm">
                <img
                  src={logo}
                  alt="QuickCliniq"
                  className="h-10 w-10 rounded-lg object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-slate-950">
                  QuickCliniq
                </p>
                <p className="text-sm text-slate-500">
                  Doctor workspace
                </p>
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
              Sign in
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Access your clinic schedule and appointments.
            </p>
          </div>

          <label className="mt-7 block">
              <span className="text-sm font-medium text-slate-700">
              Username
            </span>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
              <UserRound
                size={18}
                className="shrink-0 text-slate-400"
              />
              <input
                type="text"
                autoComplete="username"
                placeholder="sandhya"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                className="min-h-12 w-full bg-transparent text-base outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <p className="mt-2 text-xs text-slate-500">
            Use the clinic username shared with you.
          </p>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">
              Password
            </span>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
              <LockKeyhole
                size={18}
                className="shrink-0 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                className="min-h-12 w-full bg-transparent text-base outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Need access?
            </span>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="font-semibold text-teal-700 transition hover:text-teal-800 disabled:opacity-60"
            >
              {forgotLoading ? "Sending..." : "Forgot password?"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-5 rounded-lg px-4 py-3 text-sm ${
                messageType === "error"
                  ? "bg-red-50 text-red-700"
                  : messageType === "success"
                    ? "bg-teal-50 text-teal-700"
                    : "bg-slate-50 text-slate-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}
            {loading ? "Logging in" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
