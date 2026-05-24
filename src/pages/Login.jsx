import { useState, useEffect }
from "react";

import { useNavigate }
from "react-router-dom";


export default function Login() {

  const navigate =
    useNavigate();

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [password, setPassword] =
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
  // LOGIN
  // ===================================================

  const handleLogin =
  async () => {

    if (!phoneNumber) {

      setMessage(
        "Enter phone number"
      );

      return;
    }

    if (!password) {

      setMessage(
        "Enter password"
      );

      return;
    }

    setLoading(true);

    setMessage("");

    try {

      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL}/login`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              phone_number:
                phoneNumber,

              password:
                password,
            }),
          }
        );

      const data =
        await response.json();

      if (data.success) {

        localStorage.setItem(

          "phone_number",

          phoneNumber
        );

        setMessage(
          "OTP sent successfully"
        );

        setTimeout(() => {

          navigate(
            "/verify_otp"
          );

        }, 1000);

      } else {

        setMessage(

          data.message ||

          "Login failed"
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

              Clinic Login

            </p>

          </div>

        </div>


        {/* TITLE */}

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">

          Sign In

        </h2>

        <p className="text-gray-500 mb-6">

          Enter your WhatsApp number to continue.

        </p>


        {/* PHONE */}

        <input
          type="text"
          placeholder="+91XXXXXXXXXX"
          value={phoneNumber}
          onChange={(e) =>
            setPhoneNumber(
              e.target.value
            )
          }
          className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-lg outline-none focus:border-black mb-4"
        />


        {/* PASSWORD */}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-lg outline-none focus:border-black mb-5"
        />


        {/* BUTTON */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black hover:opacity-90 disabled:opacity-50 text-white py-4 rounded-2xl font-semibold transition"
        >

          {
            loading

              ? "Sending OTP..."

              : "Send OTP"
          }

        </button>


        {/* MESSAGE */}

        {message && (

          <p className="mt-5 text-center text-sm text-gray-600">

            {message}

          </p>
        )}


        {/* FOOTER */}

        <p className="mt-8 text-center text-sm text-gray-400">

          Powered by QuickCliniq

        </p>

      </div>

    </div>
  );
}