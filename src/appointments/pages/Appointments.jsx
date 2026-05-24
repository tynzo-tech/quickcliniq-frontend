import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import Layout
from "../../components/Layout";


export default function Appointments() {

  // ===================================================
  // STATES
  // ===================================================

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ===================================================
  // FETCH APPOINTMENTS
  // ===================================================

  useEffect(() => {

    fetchAppointments();

  }, []);


  const fetchAppointments =
  async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await axios.get(

          `${import.meta.env.VITE_API_URL}/appointments`
        );

      setAppointments(
        response.data
      );

    } catch (error) {

      console.log(error);

      setError(
        "Failed to load appointments"
      );

    } finally {

      setLoading(false);
    }
  };


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

          Loading appointments...

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
      title="Appointments"
      subtitle="Manage all patient appointments."
    >

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500 text-sm">
            Total Appointments
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {appointments.length}
          </h2>

        </div>


        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500 text-sm">
            Confirmed
          </p>

          <h2 className="text-4xl font-bold mt-2">

            {
              appointments.filter(
                (appointment) =>
                  appointment.status
                  === "booked"
              ).length
            }

          </h2>

        </div>


        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500 text-sm">
            Doctors
          </p>

          <h2 className="text-4xl font-bold mt-2">

            {
              [
                ...new Set(

                  appointments.map(
                    (appointment) =>
                      appointment.doctor_name
                  )
                )
              ].length
            }

          </h2>

        </div>

      </div>


      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {
        appointments.length === 0 && (

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

            No appointments yet

          </div>
        )
      }


      {/* ===================================================
          TABLE
      =================================================== */}

      {
        appointments.length > 0 && (

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

            <div className="p-6 border-b border-gray-100">

              <h2 className="text-xl font-semibold">
                Appointment List
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Today's patient appointments.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-gray-50 text-sm text-gray-600">

                  <tr>

                    <th className="px-6 py-4">
                      Patient
                    </th>

                    <th className="px-6 py-4">
                      Doctor
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Time
                    </th>

                    <th className="px-6 py-4">
                      Problem
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {

                    appointments.map(
                      (appointment) => (

                        <tr
                          key={appointment.id}
                          className="border-t border-gray-100"
                        >

                          <td className="px-6 py-5 font-medium text-gray-900">

                            <div>

                              <p>
                                {
                                  appointment.patient_name
                                }
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                {
                                  appointment.phone_number
                                }
                              </p>

                            </div>

                          </td>

                          <td className="px-6 py-5">

                            {
                              appointment.doctor_name
                            }

                          </td>

                          <td className="px-6 py-5">

                            {
                              appointment.appointment_date
                            }

                          </td>

                          <td className="px-6 py-5">

                            {
                              appointment.appointment_time
                            }

                          </td>

                          <td className="px-6 py-5">

                            {
                              appointment.problem
                            }

                          </td>

                          <td className="px-6 py-5">

                            <span
                              className="
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                bg-green-100
                                text-green-700
                              "
                            >

                              {
                                appointment.status
                              }

                            </span>

                          </td>

                        </tr>
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