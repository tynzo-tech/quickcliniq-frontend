import {
  Link,
  useLocation
} from "react-router-dom";


export default function Sidebar() {

  const location =
    useLocation();

  const menus = [

    {
      name: "Dashboard",
      path: "/dashboard"
    },

    {
      name: "Appointments",
      path: "/appointments"
    },

    {
      name: "Shifts",
      path: "/slots"
    },

    {
      name: "Patients",
      path: "/patients"
    },

    {
      name: "Doctors",
      path: "/doctors"
    },

    {
      name: "Profile",
      path: "/profile"
    },

    {
      name: "Security",
      path: "/settings/security"
    },

    {
      name: "Appearance",
      path: "/settings/appearance"
    }
  ];


  return (

    <div className="w-64 bg-white min-h-screen border-r border-gray-200">

      {/* LOGO */}

      <div className="p-6 border-b border-gray-100">

        <h1 className="text-2xl font-bold">
          QuickCliniq
        </h1>

      </div>


      {/* MENUS */}

      <div className="p-4 space-y-2">

        {menus.map((menu) => (

          <Link
            key={menu.path}
            to={menu.path}
          >

            <button
              className={`

                w-full
                text-left
                px-4
                py-3
                rounded-xl
                transition

                ${
                  location.pathname
                  === menu.path

                    ? "bg-black text-white"

                    : "hover:bg-gray-100"
                }
              `}
            >

              {menu.name}

            </button>

          </Link>
        ))}

      </div>

    </div>
  );
}
