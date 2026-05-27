import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, LogOut, Phone, Settings } from "lucide-react";


const NAV = [
  {
    label: "WhatsApp Numbers",
    path: "/admin/whatsapp",
    icon: Phone
  },
  {
    label: "Clinics",
    path: "/admin/clinics",
    icon: Building2
  },
  {
    label: "Meta Settings",
    path: "/admin/meta",
    icon: Settings
  }
];


export default function AdminLayout({ title, subtitle, children }) {

  const location = useLocation();
  const navigate = useNavigate();

  function logout() {

    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            QuickCliniq
          </p>
          <p className="mt-0.5 text-sm font-bold text-slate-950">
            Admin
          </p>
        </div>

        <nav className="p-3 space-y-0.5">
          {NAV.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                location.pathname === path
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-56 border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="border-b border-slate-200 bg-white px-8 py-5">
          <h1 className="text-xl font-semibold text-slate-950">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
