import { useState, useEffect }
from "react";

import { useNavigate }
from "react-router-dom";

import {
  apiUrl
} from "../config/api";

import logo from "../assets/logo.png";


export default function VerifyOtp() {

  const navigate =
    useNavigate();

  const [otp, setOtp] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ===================================================
  // AUTO REDIRECT
  // ===================================================

  useEffect(() => {

    const loggedIn =

      localStorage.getItem(
        "is_logged_in"
      );

    if (loggedIn) {

      navigate("/dashboard");
    }

  }, [navigate]);


  // ===================================================
  // VERIFY OTP
  // ===================================================

  const handleVerifyOtp =
  async () => {

    const phoneNumber =
      localStorage.getItem(
        "phone_number"
      );

    if (!phoneNumber) {

      setMessage(
        "Phone number missing"
      );

      return;
    }

    if (!otp.trim()) {

      setMessage(
        "Enter OTP"
      );

      return;
    }

    setLoading(true);

    setMessage("");

    try {

      const response =
        await fetch(

          apiUrl("/verify-otp"),

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              phone_number:
                phoneNumber,

              otp:
                otp.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (
        response.ok
        && data.success
      ) {

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

        setMessage(
          "Login successful"
        );

        setTimeout(() => {

          navigate(
            "/dashboard"
          );

        }, 1000);

      } else {

        setMessage(

          data.detail ||

          data.message ||

          "OTP verification failed"
        );
      }

    } catch (error) {

      console.log(error);

      setMessage(
        "Server connection failed"
      );

    } finally {

      setLoading(false);
    }
  };


  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-950">

      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">

        {/* HEADER */}

        <div className="mb-8 flex items-center gap-3">

          <img
            src={logo}
            alt="QuickCliniq"
            className="h-12 w-12 rounded-lg object-contain"
          />

          <div className="min-w-0">

            <h1 className="text-lg font-semibold tracking-tight text-slate-950">

              QuickCliniq

            </h1>

            <p className="text-sm text-slate-500">

              Doctor workspace

            </p>

          </div>

        </div>


        {/* TITLE */}

        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950">

          Verify OTP

        </h2>

        <p className="mb-6 text-sm text-slate-500">

          Enter the OTP sent to your WhatsApp number.

        </p>


        {/* OTP INPUT */}

        <input
          type="text"
          inputMode="numeric"
          placeholder="123456"
          value={otp}
          onChange={(event) =>
            setOtp(
              event.target.value
            )
          }
          className="mb-5 min-h-12 w-full rounded-lg border border-slate-300 px-4 text-lg outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        />


        {/* BUTTON */}

        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={loading}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >

          {
            loading

              ? "Verifying..."

              : "Verify OTP"
          }

        </button>


        {/* MESSAGE */}

        {message && (

          <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-700">

            {message}

          </p>

        )}


        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/login")
          }
          className="mt-5 w-full rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        >

          Back to Login

        </button>

      </div>

    </div>
  );
}
