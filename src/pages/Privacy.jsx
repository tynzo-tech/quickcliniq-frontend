import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">
          Effective Date: May 23, 2026
        </p>

        <div className="space-y-8 leading-7">
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              1. About Quick Cliniq
            </h2>
            <p>
              Quick Cliniq is a healthcare communication and clinic
              management platform designed to help clinics, healthcare
              providers, and businesses manage appointments, patient
              communication, notifications, and support services.
            </p>
            <p className="mt-3">
              Quick Cliniq is developed and operated by Quick Cliniq.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              2. Information We Collect
            </h2>

            <h3 className="text-lg font-medium mt-4 mb-2">
              Personal Information
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Clinic or business details</li>
              <li>Appointment information</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-2">
              Usage Information
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Device information</li>
              <li>Browser type</li>
              <li>IP address</li>
              <li>App usage statistics</li>
              <li>Log and diagnostic information</li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-2">
              Communication Data
            </h3>
            <p>
              When users communicate through WhatsApp or other supported
              channels using Quick Cliniq services, we may process message
              metadata and communication records necessary to provide the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. How We Use Information
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain our services</li>
              <li>Enable appointment booking and management</li>
              <li>Send notifications and reminders</li>
              <li>Improve customer support</li>
              <li>Monitor platform performance and security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. WhatsApp and Third-Party Services
            </h2>
            <p>
              Quick Cliniq may integrate with third-party services including
              WhatsApp Business Platform and other communication providers.
            </p>
            <p className="mt-3">
              By using our services, users acknowledge that certain data may
              be processed by these third-party providers according to their
              own privacy policies and terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              5. Data Sharing
            </h2>
            <p>We do not sell personal information.</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>With service providers supporting our platform</li>
              <li>When required by law or legal process</li>
              <li>To protect platform security and prevent misuse</li>
              <li>With client organizations using Quick Cliniq services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              6. Data Security
            </h2>
            <p>
              We implement reasonable administrative, technical, and
              organizational safeguards to protect user information against
              unauthorized access, loss, misuse, or disclosure.
            </p>
            <p className="mt-3">
              However, no method of electronic transmission or storage is
              completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain information only for as long as necessary to provide
              services, comply with legal obligations, resolve disputes, and
              enforce agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. User Rights</h2>
            <p>
              Depending on applicable laws, users may have rights to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Access their information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of data</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              9. Cookies and Analytics
            </h2>
            <p>
              Our website and applications may use cookies and analytics tools
              to improve user experience and monitor service performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              10. Children&apos;s Privacy
            </h2>
            <p>
              Quick Cliniq services are not intended for children unless used
              under the supervision of a parent, guardian, or healthcare
              provider where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Updated
              versions will be posted on this page with the revised effective
              date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
            <div className="bg-gray-100 rounded-2xl p-5 mt-3">
              <p className="font-medium">Quick Cliniq</p>
              <p>
                Website:{" "}
                <a
                  href="https://www.quickcliniq.com"
                  className="text-blue-600 hover:underline"
                >
                  https://www.quickcliniq.com
                </a>
              </p>
              <p>Email: support@quickcliniq.com</p>
            </div>
          </section>
          <section className="mt-10 text-center">
            <button
              onClick={() => navigate("/login")}
              className="
                bg-black
                text-white
                px-6
                py-3
                rounded-2xl
                font-medium
                hover:opacity-90
                transition
              "
            >
              Go to Login
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
