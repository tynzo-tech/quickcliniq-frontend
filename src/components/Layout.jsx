import {

  Link,

  useLocation,

  useNavigate

} from "react-router-dom";

import logo from "../assets/logo.png";


export default function Layout({

  children

}) {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  // ===================================================
  // CLINIC DATA
  // ===================================================

  const clinic = JSON.parse(

    localStorage.getItem(
      "clinic"
    )
  );


  // ===================================================
  // NAVIGATION ITEMS
  // ===================================================

  const navItems = [

    {
      name: "Slots",
      path: "/slots",
    },

    {
      name: "Appointments",
      path: "/appointments",
    },

    {
      name: "Patients",
      path: "/patients",
    },
  ];


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    localStorage.clear();

    navigate("/login");
  };


  return (

    <div className="min-h-screen bg-gray-100 flex">


      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className="
          w-72
          bg-white
          border-r
          border-gray-200
          flex
          flex-col
          justify-between
          p-6
          shadow-sm
        "
      >

        <div>

          {/* ===================================================
              HEADER
          =================================================== */}

          <div className="flex items-center gap-4 mb-12">

            <img
              src={logo}
              alt="QuickCliniq"
              className="
                w-14
                h-14
                object-contain
              "
            />

            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                  leading-tight
                "
              >

                {
                  clinic?.name ||

                  "QuickCliniq"
                }

              </h1>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >

                {
                  clinic?.doctor_name ||

                  "Clinic Dashboard"
                }

              </p>

            </div>

          </div>


          {/* ===================================================
              NAVIGATION
          =================================================== */}

          <nav className="space-y-3">

            {

              navItems.map((item) => (

                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    block
                    px-5
                    py-4
                    rounded-2xl
                    font-medium
                    transition-all
                    duration-200

                    ${
                      location.pathname
                      === item.path

                      ? `
                        bg-black
                        text-white
                        shadow-md
                      `

                      : `
                        bg-gray-100
                        text-gray-700
                        hover:bg-gray-200
                      `
                    }
                  `}
                >

                  {item.name}

                </Link>
              ))
            }

          </nav>

        </div>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="space-y-4">

          <div
            className="
              bg-gray-100
              rounded-2xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Logged in as
            </p>

            <p
              className="
                text-sm
                font-semibold
                text-gray-900
              "
            >

              {
                clinic?.whatsapp_number ||

                "Unknown Clinic"
              }

            </p>

          </div>


          <button
            onClick={handleLogout}
            className="
              w-full
              bg-black
              text-white
              py-4
              rounded-2xl
              font-semibold
              hover:opacity-90
              transition
            "
          >

            Logout

          </button>

        </div>

      </aside>


      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main
        className="
          flex-1
          p-8
          overflow-y-auto
        "
      >

        {children}

      </main>

    </div>
  );
}
