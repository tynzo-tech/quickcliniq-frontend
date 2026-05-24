import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import Layout
from "../../components/Layout";


export default function Patients() {

  // ===================================================
  // STATES
  // ===================================================

  const [patients, setPatients] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");


  // ===================================================
  // FETCH PATIENTS
  // ===================================================

  useEffect(() => {

    fetchPatients();

  }, []);


  const fetchPatients =
  async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await axios.get(

          `${import.meta.env.VITE_API_URL}/patients`,

          {
            params: {

              clinic_id:

                localStorage.getItem(
                  "clinic_id"
                )
            }
          }
        );

      setPatients(
        response.data
      );

    } catch (error) {

      console.log(error);

      setError(
        "Failed to load patients"
      );

    } finally {

      setLoading(false);
    }
  };


  // ===================================================
  // FILTERED PATIENTS
  // ===================================================

  const filteredPatients =

    patients.filter((patient) =>

      patient.name
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )
    );


  // ===================================================
  // LOADING UI
  // ===================================================

  if (loading) {

    return (

      <Layout>

        <div
          className="
            bg-white
            rounded-3xl
            p-10
            text-center
            shadow-sm
          "
        >

          Loading patients...

        </div>

      </Layout>
    );
  }


  // ===================================================
  // ERROR UI
  // ===================================================

  if (error) {

    return (

      <Layout>

        <div
          className="
            bg-red-50
            text-red-600
            rounded-3xl
            p-10
            text-center
            shadow-sm
          "
        >

          {error}

        </div>

      </Layout>
    );
  }


  return (

    <Layout
      title="Patients"
      subtitle="View and manage clinic patients."
    >

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500 text-sm">
            Total Patients
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {patients.length}
          </h2>

        </div>


        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500 text-sm">
            Returning Patients
          </p>

          <h2 className="text-4xl font-bold mt-2">

            {patients.length}

          </h2>

        </div>


        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500 text-sm">
            Today's Visits
          </p>

          <h2 className="text-4xl font-bold mt-2">

            0

          </h2>

        </div>

      </div>


      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {
        patients.length === 0 && (

          <div
            className="
              bg-white
              rounded-3xl
              p-12
              text-center
              shadow-sm
              text-gray-500
            "
          >

            No patients found.

          </div>
        )
      }


      {/* ===================================================
          TABLE
      =================================================== */}

      {
        patients.length > 0 && (

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

            <div className="p-6 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  Patient List
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  All registered clinic patients.
                </p>

              </div>

              <input
                type="text"
                placeholder="Search patient"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="
                  border
                  border-gray-200
                  rounded-xl
                  px-4
                  py-2
                  outline-none
                "
              />

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-gray-50 text-sm text-gray-600">

                  <tr>

                    <th className="px-6 py-4">
                      Name
                    </th>

                    <th className="px-6 py-4">
                      Age
                    </th>

                    <th className="px-6 py-4">
                      Gender
                    </th>

                    <th className="px-6 py-4">
                      Phone Number
                    </th>

                    <th className="px-6 py-4">
                      Registered On
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    filteredPatients.length === 0 ? (

                      <tr>

                        <td
                          colSpan="5"
                          className="
                            px-6
                            py-10
                            text-center
                            text-gray-500
                          "
                        >

                          No matching patients found.

                        </td>

                      </tr>

                    ) : (

                      filteredPatients.map(
                        (patient) => (

                          <tr
                            key={patient.id}
                            className="border-t border-gray-100"
                          >

                            <td className="px-6 py-5 font-medium text-gray-900">

                              {
                                patient.name
                              }

                            </td>

                            <td className="px-6 py-5">

                              {
                                patient.age
                              }

                            </td>

                            <td className="px-6 py-5">

                              {
                                patient.gender
                              }

                            </td>

                            <td className="px-6 py-5">

                              {
                                patient.phone_number
                              }

                            </td>

                            <td className="px-6 py-5">

                              {
                                patient.created_at
                              }

                            </td>

                          </tr>
                        )
                      )
                    )
                  }

                </tbody>

              </table>

            </div>

          </div>
        )
      }

    </Layout>
  );
}