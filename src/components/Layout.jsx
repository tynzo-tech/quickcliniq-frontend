import {
  CalendarDays,
  ChevronRight,
  LogOut,
  Users,
  Clock3
  ,
  UserRound
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

  const navItems = [
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
      icon: UserRound,
      name: "Profile",
      path: "/profile"
    }
  ];

  const theme =
    localStorage.getItem(
      "theme"
    ) || "light";

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

  return (

    <div className={`theme-${theme} min-h-screen bg-slate-50 text-slate-950`}>
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 px-4 py-5 shadow-sm shadow-slate-950/3 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/slots"
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
            >
              <img
                src={logo}
                alt="QuickCliniq"
                className="h-11 w-11 rounded-lg object-contain"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950">
                  {clinic?.name || "QuickCliniq"}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {clinic?.doctor_name || "Clinic workspace"}
                </p>
              </div>
            </Link>

            <nav className="mt-8 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                        : "text-slate-600 hover:bg-teal-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">
                      {item.name}
                    </span>
                    {active && (
                      <ChevronRight size={16} />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Logged in as
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                {displayPhone}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-red-100 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={logo}
                  alt="QuickCliniq"
                  className="h-10 w-10 rounded-lg object-contain"
                />
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

            <nav className="mt-3 grid grid-cols-4 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold ${
                      active
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={15} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {(title || subtitle || actions) && (
                <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white/85 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    {title && (
                      <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
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
