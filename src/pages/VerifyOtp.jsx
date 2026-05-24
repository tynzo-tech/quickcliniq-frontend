import { useState, useEffect }
from "react";

import { useNavigate }
from "react-router-dom";


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

      navigate("/slots");
    }

  }, []);


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

          `${import.meta.env.VITE_API_URL}/verify-otp`,

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

      if (data.success) {

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
            "/slots"
          );

        }, 1000);

      } else {

        setMessage(

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

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-8">

          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold">

            Q

          </div>

          <div>

            <h1 className="text-3xl font-bold text-gray-900">

              QuickCliniq

            </h1>

            <p className="text-gray-500 text-sm">

              OTP Verification

            </p>

          </div>

        </div>


        {/* TITLE */}

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">

          Verify OTP

        </h2>

        <p className="text-gray-500 mb-6">

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
          className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-lg outline-none focus:border-black mb-5"
        />


        {/* BUTTON */}

        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={loading}
          className="w-full bg-black hover:opacity-90 disabled:opacity-50 text-white py-4 rounded-2xl font-semibold transition"
        >

          {
            loading

              ? "Verifying..."

              : "Verify OTP"
          }

        </button>


        {/* MESSAGE */}

        {message && (

          <p className="mt-5 text-center text-sm text-gray-600">

            {message}

          </p>

        )}


        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/login")
          }
          className="w-full mt-5 text-sm text-gray-500 hover:underline"
        >

          Back to Login

        </button>

      </div>

    </div>
  );
}