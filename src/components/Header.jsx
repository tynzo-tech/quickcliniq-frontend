import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";

function Header() {

  const navigate = useNavigate();

  return (
    <header
      style={{
        width: "100%",
        height: "80px",
        background: "#ffffffee",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
        }}
      >

        {/* Left Logo */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            cursor: "pointer",
          }}
        >
          <img
            src={logo}
            alt="QuickCliniq"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              objectFit: "contain",
            }}
          />

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "26px",
                color: "#111827",
              }}
            >
              Quick Cliniq
            </h2>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              WhatsApp clinic automation
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={navBtn}
          >
            Home
          </button>

          <button
            onClick={() => navigate("/privacy")}
            style={navBtn}
          >
            Privacy
          </button>

          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "12px 22px",
              border: "none",
              borderRadius: "12px",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}

const navBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  color: "#374151",
};

export default Header;
