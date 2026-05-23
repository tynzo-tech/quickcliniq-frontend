import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    const phoneNumber = localStorage.getItem("phone_number");

    if (!phoneNumber) {
      setMessage("Phone number missing. Please login again.");
      return;
    }

    if (!otp.trim()) {
      setMessage("Enter OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("clinic", JSON.stringify(data.clinic));
        setMessage("Login successful");
        navigate("/");
        return;
      }

      setMessage(data.message || "OTP verification failed");
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            Q
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quick Cliniq
            </h1>
            <p className="text-gray-500 text-sm">
              OTP Verification
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Verify OTP
        </h2>

        <p className="text-gray-500 mb-6">
          Enter the OTP sent to your WhatsApp number.
        </p>

        <input
          type="text"
          inputMode="numeric"
          placeholder="123456"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-lg outline-none focus:border-blue-500 mb-5"
        />

        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-2xl font-semibold transition"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {message && (
          <p className="mt-5 text-center text-sm text-gray-600">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full mt-5 text-sm text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
