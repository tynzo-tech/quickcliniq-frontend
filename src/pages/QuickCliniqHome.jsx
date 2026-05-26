import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Stethoscope,
  Workflow,
} from "lucide-react";

import logoUrl from "../images/logo.png";
import "./QuickCliniqHome.css";

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp booking flow",
    description:
      "Patients can book, reschedule, or cancel appointments from WhatsApp with short replies like 1, book, modify, or cancel.",
  },
  {
    icon: Bot,
    title: "Conversational intake",
    description:
      "Collect patient name, age, gender, symptoms, doctor, date, and time with guided prompts that understand natural text.",
  },
  {
    icon: RefreshCcw,
    title: "Modify without restarting",
    description:
      "Patients can correct details such as name, age, symptoms, gender, date, doctor, or slot before confirmation.",
  },
  {
    icon: LayoutDashboard,
    title: "Clinic control pane",
    description:
      "Doctors, schedules, unavailable blocks, patient records, and appointment activity stay organized for staff.",
  },
];

const workflow = [
  "Patient chooses book, reschedule, or cancel",
  "Quick Cliniq collects the right appointment details",
  "Available slots are checked against doctor schedules",
  "The clinic dashboard stays updated automatically",
];

const capabilities = [
  "Book, reschedule, and cancel on WhatsApp",
  "Natural date and time understanding",
  "Multi-doctor routing",
  "Doctor schedule and slot management",
  "Unavailable time blocking",
  "Dashboard appointment records",
  "Patient profile continuity",
  "Theme and clinic preferences",
];

const faqs = [
  {
    question: "Is WhatsApp Business required?",
    answer:
      "Yes. Production messaging uses the WhatsApp Business Platform, so each clinic needs a configured WhatsApp Business setup.",
  },
  {
    question: "Can patients reschedule or cancel by message?",
    answer:
      "Yes. Patients can send short replies such as modify, reschedule, cancel, or menu numbers. Quick Cliniq guides them through the next step.",
  },
  {
    question: "Does it support multiple doctors?",
    answer:
      "Yes. Clinics can manage multiple doctors, schedules, slot durations, and unavailable blocks from the dashboard.",
  },
  {
    question: "Does it work for small clinics?",
    answer:
      "Yes. Quick Cliniq is designed to keep a small clinic desk efficient without adding a heavy enterprise workflow.",
  },
];

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-teal-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">
        <Icon size={21} />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center transition hover:opacity-80"
          aria-label="Quick Cliniq home"
        >
          <img
            src={logoUrl}
            alt="Quick Cliniq"
            className="quickcliniq-logo-lockup"
          />
        </button>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a className="transition hover:text-slate-950" href="#product">
            Product
          </a>
          <a className="transition hover:text-slate-950" href="#features">
            Features
          </a>
          <a className="transition hover:text-slate-950" href="#workflow">
            Workflow
          </a>
          <a className="transition hover:text-slate-950" href="#operations">
            Operations
          </a>
          <a className="transition hover:text-slate-950" href="#faq">
            FAQ
          </a>
          <a className="transition hover:text-slate-950" href="#contact">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Login
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl" id="product">
      <div className="absolute -inset-6 -z-10 rounded-lg bg-linear-to-r from-teal-200/40 via-cyan-200/30 to-slate-200/40 blur-3xl" />
      <div className="quickcliniq-float rounded-lg border border-white/70 bg-white/85 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
        <div className="rounded-lg border border-slate-200 bg-slate-950 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-teal-300">
                WhatsApp desk
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Appointment assistant
              </h3>
            </div>
            <div className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 sm:block">
              Live clinic flow
            </div>
          </div>

          <div className="grid gap-4 pt-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              {[
                {
                  title: "Patient replied 1",
                  detail: "Booking flow started and patient details are being collected",
                  status: "Book",
                },
                {
                  title: "Patient typed modify",
                  detail: "Existing appointment found and new date requested",
                  status: "Reschedule",
                },
                {
                  title: "Patient typed cancel",
                  detail: "Cancellation confirmation sent before changing status",
                  status: "Confirm",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-white/10 bg-white/6 p-4 transition hover:bg-white/9"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-white">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-teal-400/10 px-2.5 py-1 text-xs font-medium text-teal-200">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/6 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">
                  Automation health
                </h4>
                <span className="h-2.5 w-2.5 rounded-full bg-teal-300" />
              </div>
              <div className="mt-5 space-y-5">
                {[
                  ["Doctor routing", "Ready"],
                  ["Slot checks", "Fast"],
                  ["Dashboard sync", "Active"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-teal-200">{value}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div className="h-full w-4/5 rounded-full bg-linear-to-r from-teal-300 to-cyan-300" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-white p-4 text-slate-950">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-semibold">
                      Patient message understood
                    </p>
                    <p className="text-xs text-slate-500">
                      today, next Sunday, 9 AM, book, cancel, modify
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="absolute left-1/2 top-0 -z-10 h-125 w-125 -translate-x-1/2 rounded-full bg-teal-100/60 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex rounded-lg border border-teal-200 bg-white/70 px-3 py-2 text-sm font-medium text-teal-800 shadow-sm">
            WhatsApp appointment automation for modern clinics
          </div>

          <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Book, reschedule, and cancel appointments from WhatsApp.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Quick Cliniq gives clinics a clean SaaS workspace and a WhatsApp
            assistant that handles patient intake, slot checks, appointment
            changes, cancellations, and dashboard updates.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto"
            >
              Open clinic dashboard
              <ArrowRight size={17} />
            </button>
            <a
              href="#product"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 sm:w-auto"
            >
              View product
            </a>
          </div>
        </div>

        <div className="mt-16">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Designed for clinic teams"
          title="A practical appointment layer for busy clinic desks."
          description="Quick Cliniq keeps patient communication simple while giving staff the controls they need for doctors, schedules, slots, and records."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-teal-600">
            Workflow
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            From WhatsApp message to confirmed visit, without the manual chase.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            Patients can use natural messages or simple menu numbers. Staff
            still keep final visibility through the clinic dashboard.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/5">
          <div className="space-y-3">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-semibold text-teal-700 shadow-sm">
                  {index + 1}
                </div>
                <p className="font-medium text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section id="operations" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 md:p-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Stethoscope size={21} />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
              Built around real clinic operations.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The goal is not to add another noisy tool. It is to reduce
              repetitive coordination while keeping appointment control clear.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div
                key={capability}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700"
              >
                <Check size={17} className="text-teal-600" />
                {capability}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          eyebrow="FAQ"
          title="Common questions, clear answers."
          description="A quick look at what clinics usually ask before using Quick Cliniq."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/5"
            >
              <h3 className="text-lg font-semibold text-slate-950">
                {faq.question}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const navigate = useNavigate();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-slate-950 px-6 py-14 text-center shadow-2xl shadow-slate-950/20 md:px-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-teal-200">
          <CalendarCheck size={23} />
        </div>
        <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Give your clinic desk a cleaner way to manage appointments.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-300">
          Start with WhatsApp booking, then bring schedules, doctors, patients,
          and appointment changes into one calmer workflow.
        </p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-50"
        >
          Open Quick Cliniq
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();

  return (
    <footer id="contact" className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div>
          <img
            src={logoUrl}
            alt="Quick Cliniq"
            className="quickcliniq-logo-lockup"
          />
          <p className="mt-5 max-w-md leading-7 text-slate-600">
            WhatsApp-first appointment automation and clinic operations software.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">Product</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <a className="block transition hover:text-slate-950" href="#features">
              Features
            </a>
            <a className="block transition hover:text-slate-950" href="#workflow">
              Workflow
            </a>
            <a className="block transition hover:text-slate-950" href="#operations">
              Operations
            </a>
            <button
              type="button"
              onClick={() => navigate("/privacy")}
              className="block transition hover:text-slate-950"
            >
              Privacy
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <a
              className="block transition hover:text-slate-950"
              href="mailto:support@quickcliniq.com"
            >
              support@quickcliniq.com
            </a>
            <a
              className="flex items-center gap-2 transition hover:text-slate-950"
              href="https://wa.me/918297997929"
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={16} />
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>(c) 2026 Quick Cliniq. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} />
          Built for clinic communication workflows
        </div>
      </div>
    </footer>
  );
}

export default function QuickCliniqHome() {
  return (
    <div className="quickcliniq-home min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <WorkflowSection />
        <Capabilities />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
