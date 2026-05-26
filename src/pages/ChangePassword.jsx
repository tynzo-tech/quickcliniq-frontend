import {
  useEffect,
  useState
} from "react";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import {
  apiUrl
} from "../config/api";

import logo from "../assets/logo.png";


function getPendingClinic() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "pending_password_clinic"
      )
    );

  } catch {

    return null;
  }
}


export default function ChangePassword() {

  const navigate =
    useNavigate();

  const [clinic] =
    useState(() => getPendingClinic());

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPasswords, setShowPasswords] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("info");

  const [loading, setLoading] =
    useState(false);


  useEffect(() => {

    if (!clinic?.id) {

      navigate(
        "/login",
        {
          replace: true
        }
      );
    }

  }, [clinic?.id, navigate]);


  const showFormMessage = (
    nextMessage,
    nextType = "info"
  ) => {

    setMessage(nextMessage);
    setMessageType(nextType);
  };


  const responseMessage = (
    data,
    fallback
  ) => {

    if (typeof data.detail === "string") {

      return data.detail;
    }

    if (Array.isArray(data.detail)) {

      return data.detail[0]?.msg || fallback;
    }

    return data.message || fallback;
  };


  const parseResponse =
  async (response) => {

    try {

      return await response.json();

    } catch {

      return {};
    }
  };


  const handleSubmit =
  async (event) => {

    event.preventDefault();

    if (!currentPassword) {

      showFormMessage(
        "Enter your current password.",
        "error"
      );

      return;
    }

    if (newPassword.length < 8) {

      showFormMessage(
        "New password must be at least 8 characters.",
        "error"
      );

      return;
    }

    if (currentPassword === newPassword) {

      showFormMessage(
        "New password must be different from current password.",
        "error"
      );

      return;
    }

    if (newPassword.trim() !== newPassword) {

      showFormMessage(
        "New password cannot start or end with spaces.",
        "error"
      );

      return;
    }

    if (newPassword !== confirmPassword) {

      showFormMessage(
        "New passwords do not match.",
        "error"
      );

      return;
    }

    setLoading(true);
    showFormMessage("");

    try {

      const response =
        await fetch(
          apiUrl("/change-password"),
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              clinic_id:
                clinic.id,
              current_password:
                currentPassword,
              new_password:
                newPassword,
            }),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok || !data.success) {

        showFormMessage(
          responseMessage(
            data,
            "Could not change password."
          ),
          "error"
        );

        return;
      }

      localStorage.removeItem(
        "pending_password_clinic"
      );

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
        "Password changed successfully.",
        "success"
      );

      setTimeout(() => {

        navigate(
          "/slots"
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


  return (

    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 sm:p-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="QuickCliniq"
                className="h-12 w-12 rounded-lg object-contain"
              />
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-slate-950">
                  QuickCliniq
                </p>
                <p className="text-sm text-slate-500">
                  Doctor workspace
                </p>
              </div>
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
              Change password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {clinic?.name || "QuickCliniq clinic account"}
            </p>
          </div>

          {[
            {
              label: "Current password",
              value: currentPassword,
              setValue: setCurrentPassword,
              autoComplete: "current-password"
            },
            {
              label: "New password",
              value: newPassword,
              setValue: setNewPassword,
              autoComplete: "new-password"
            },
            {
              label: "Confirm new password",
              value: confirmPassword,
              setValue: setConfirmPassword,
              autoComplete: "new-password"
            }
          ].map((field) => (
            <label
              key={field.label}
              className="mt-5 block"
            >
              <span className="text-sm font-medium text-slate-700">
                {field.label}
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-slate-400"
                />
                <input
                  type={showPasswords ? "text" : "password"}
                  autoComplete={field.autoComplete}
                  value={field.value}
                  onChange={(event) =>
                    field.setValue(
                      event.target.value
                    )
                  }
                  className="min-h-12 w-full bg-transparent text-base outline-none"
                />
              </div>
            </label>
          ))}

          <button
            type="button"
            onClick={() =>
              setShowPasswords(
                (value) => !value
              )
            }
            className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {showPasswords ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
            {showPasswords ? "Hide passwords" : "Show passwords"}
          </button>

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
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}
            {loading ? "Changing password" : "Change password"}
          </button>
        </form>
      </section>
    </main>
  );
}
