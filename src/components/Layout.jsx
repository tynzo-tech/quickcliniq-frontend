import {
  useEffect,
  useState
} from "react";

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  House,
  LogOut,
  Palette,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
  Clock3,
  UserRound,
  MessageCircle
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import logo from "../assets/logo.png";


function getStoredClinic() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "clinic"
      )
    );

  } catch {

    return null;
  }
}

function getStoredTheme() {

  return localStorage.getItem(
    "theme"
  ) || "light";
}


export default function Layout({
  children,
  title,
  subtitle,
  actions
}) {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const clinic = getStoredClinic();

  const [theme, setTheme] =
    useState(
      getStoredTheme
    );

  const navItems = [
    {
      icon: House,
      name: "Dashboard",
      path: "/dashboard"
    },
    {
      icon: Clock3,
      name: "Schedule",
      path: "/slots"
    },
    {
      icon: CalendarDays,
      name: "Appointments",
      path: "/appointments"
    },
    {
      icon: Users,
      name: "Patients",
      path: "/patients"
    },
    {
      icon: Stethoscope,
      name: "Doctors",
      path: "/doctors"
    }
  ];

  const settingsItems = [
    {
      icon: UserRound,
      name: "Profile",
      path: "/profile"
    },
    {
      icon: ShieldCheck,
      name: "Security",
      path: "/settings/security"
    },
    {
      icon: Palette,
      name: "Appearance",
      path: "/settings/appearance"
    }
  ];

  const mobileItems = [
    ...navItems,
    ...settingsItems
  ];

  const settingsActive =
    settingsItems.some((item) =>
      location.pathname === item.path
    );

  useEffect(() => {

    const handleThemeChange =
      (event) => {

        setTheme(
          event.detail?.theme ||
            getStoredTheme()
        );
      };

    window.addEventListener(
      "quickcliniq-theme-change",
      handleThemeChange
    );

    window.addEventListener(
      "storage",
      handleThemeChange
    );

    return () => {

      window.removeEventListener(
        "quickcliniq-theme-change",
        handleThemeChange
      );

      window.removeEventListener(
        "storage",
        handleThemeChange
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const displayPhone =
    clinic?.phone_number ||
    localStorage.getItem(
      "phone_number"
    ) ||
    "Clinic account";

  const displayName =
    clinic?.doctor_name ||
    clinic?.name ||
    "Clinic user";

  const displayInitials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "QC";

  return (

    <div className={`theme-${theme} min-h-screen bg-slate-50 text-slate-950`}>
      <div className="flex min-h-screen">
        <aside className="hidden w-52 shrink-0 border-r border-slate-200/80 bg-white/95 px-2.5 py-3 shadow-sm shadow-slate-950/5 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 shadow-sm">
                <img
                  src={logo}
                  alt="QuickCliniq"
                  className="h-6 w-6 rounded-lg object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold tracking-tight text-slate-950">
                  {clinic?.name || "QuickCliniq"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {clinic?.doctor_name || "Clinic workspace"}
                </p>
              </div>
            </Link>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                      active
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                        : "text-slate-600 hover:bg-teal-50/80 hover:text-slate-950"
                    }`}
                  >
                    <Icon size={15} />
                    <span className="flex-1">
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              <details
                className="group"
                open={settingsActive}
              >
                <summary className={`flex min-h-9 cursor-pointer list-none items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                  settingsActive
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-teal-50 hover:text-slate-950"
                }`}
                >
                  <Settings size={15} />
                  <span className="flex-1">
                    Settings
                  </span>
                  <ChevronDown
                    size={14}
                    className="transition group-open:rotate-180"
                  />
                </summary>

                <div className="mt-1 space-y-1 pl-4">
                  {settingsItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex min-h-8 items-center gap-2 rounded-lg px-2.5 text-[11px] font-semibold transition ${
                          active
                            ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                            : "text-slate-600 hover:bg-teal-50 hover:text-slate-950"
                        }`}
                      >
                        <Icon size={14} />
                        <span className="flex-1">
                          {item.name}
                        </span>
                        {active && (
                          <ChevronRight size={13} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </details>
            </nav>
          </div>

          <details className="group relative">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 p-2 transition hover:bg-slate-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-bold text-white">
                {displayInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-slate-950">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {displayPhone}
                </p>
              </div>
              <ChevronDown
                size={12}
                className="shrink-0 text-slate-400 transition group-open:rotate-180"
              />
            </summary>
            <div className="absolute bottom-full left-0 right-0 z-30 mb-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-2 text-[11px] font-semibold text-red-700 transition hover:bg-red-50"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </details>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50">
                  <img
                    src={logo}
                    alt="QuickCliniq"
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {clinic?.name || "QuickCliniq"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {displayPhone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {mobileItems.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${
                      active
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100/80 text-slate-600 hover:bg-teal-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon size={15} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="min-w-0 flex-1 px-3 py-3 sm:px-4 lg:px-4">
            <div className="mx-auto max-w-270">
              {(title || subtitle || actions) && (
                <div className="mb-3 flex flex-col gap-3 rounded-lg border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    {title && (
                      <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="mt-1 max-w-2xl text-[13px] leading-5 text-slate-500">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {actions}
                    </div>
                  )}
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
