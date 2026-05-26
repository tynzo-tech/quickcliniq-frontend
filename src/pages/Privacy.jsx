import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import logo from "../images/logo.png";


const sections = [
  {
    title: "1. About Quick Cliniq",
    body: [
      "Quick Cliniq is a healthcare communication and clinic management platform designed to help clinics, healthcare providers, and businesses manage appointments, patient communication, notifications, and support services.",
      "Quick Cliniq is developed and operated by Quick Cliniq."
    ]
  },
  {
    title: "2. Information We Collect",
    body: [
      "Personal information may include name, phone number, email address, clinic or business details, appointment information, and communication preferences.",
      "Usage information may include device information, browser type, IP address, app usage statistics, logs, and diagnostic information.",
      "When users communicate through WhatsApp or other supported channels, we may process message metadata and communication records necessary to provide the service."
    ]
  },
  {
    title: "3. How We Use Information",
    body: [
      "We use information to provide and maintain services, enable appointment booking, send notifications and reminders, improve support, monitor performance and security, and comply with legal obligations."
    ]
  },
  {
    title: "4. WhatsApp and Third-Party Services",
    body: [
      "Quick Cliniq may integrate with third-party services including WhatsApp Business Platform and other communication providers.",
      "By using our services, users acknowledge that certain data may be processed by these third-party providers according to their own privacy policies and terms."
    ]
  },
  {
    title: "5. Data Sharing",
    body: [
      "We do not sell personal information.",
      "We may share data with service providers supporting our platform, when required by law, to protect platform security, or with client organizations using Quick Cliniq services."
    ]
  },
  {
    title: "6. Data Security",
    body: [
      "We implement reasonable administrative, technical, and organizational safeguards to protect user information against unauthorized access, loss, misuse, or disclosure.",
      "No method of electronic transmission or storage is completely secure."
    ]
  },
  {
    title: "7. Data Retention",
    body: [
      "We retain information only for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements."
    ]
  },
  {
    title: "8. User Rights",
    body: [
      "Depending on applicable laws, users may have rights to access their information, correct inaccurate data, request deletion, and withdraw consent where applicable."
    ]
  },
  {
    title: "9. Cookies and Analytics",
    body: [
      "Our website and applications may use cookies and analytics tools to improve user experience and monitor service performance."
    ]
  },
  {
    title: "10. Children's Privacy",
    body: [
      "Quick Cliniq services are not intended for children unless used under the supervision of a parent, guardian, or healthcare provider where applicable."
    ]
  },
  {
    title: "11. Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy from time to time. Updated versions will be posted on this page with the revised effective date."
    ]
  }
];


export default function PrivacyPolicyPage() {

  const navigate =
    useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center transition hover:opacity-80"
            aria-label="Quick Cliniq home"
          >
            <img
              src={logo}
              alt="Quick Cliniq"
              className="h-11 w-auto object-contain"
            />
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Login
            <ChevronRight size={16} />
          </button>
        </nav>
      </header>

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Home
          </button>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 md:p-8">
            <div className="flex flex-col gap-5 border-b border-slate-100 pb-8 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-teal-600">
                  Trust and privacy
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  Privacy Policy
                </h1>
                <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                  How Quick Cliniq handles clinic, patient, and communication data across the platform.
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                <ShieldCheck size={17} />
                Effective May 23, 2026
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-5"
                >
                  <h2 className="text-lg font-semibold text-slate-950">
                    {section.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}

              <section className="rounded-lg border border-slate-100 bg-slate-950 p-5 text-white">
                <h2 className="text-lg font-semibold">
                  12. Contact Us
                </h2>
                <div className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  <p className="font-semibold text-white">
                    Quick Cliniq
                  </p>
                  <p>
                    Website:{" "}
                    <a
                      href="https://www.quickcliniq.com"
                      className="text-teal-200 transition hover:text-white"
                    >
                      https://www.quickcliniq.com
                    </a>
                  </p>
                  <p>
                    Email: support@quickcliniq.com
                  </p>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
