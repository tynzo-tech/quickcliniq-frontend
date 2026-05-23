function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        background: "#111827",
        color: "#fff",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "50px 40px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "40px",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "10px" }}>
            Quick Cliniq
          </h2>

          <p
            style={{
              color: "#9ca3af",
              maxWidth: "350px",
              lineHeight: "1.7",
            }}
          >
            Smart WhatsApp-powered clinic management platform built for modern
            healthcare providers.
          </p>
        </div>

        <div>
          <h3>Platform</h3>
          <p style={footerText}>Appointments</p>
          <p style={footerText}>Patient Management</p>
          <p style={footerText}>WhatsApp Automation</p>
        </div>

        <div>
          <h3>Company</h3>
          <p style={footerText}>Quick Cliniq</p>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #374151",
          textAlign: "center",
          padding: "20px",
          color: "#9ca3af",
        }}
      >
        (c) 2026 Quick Cliniq - Built for clinics
        <br />
        A product of{" "}
        <a
          href="https://tynzo.tech"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#3b82f6", textDecoration: "none" }}
        >
          tynzo.tech
        </a>
      </div>
    </footer>
  );
}

const footerText = {
  color: "#9ca3af",
  marginTop: "12px",
};

export default Footer;
