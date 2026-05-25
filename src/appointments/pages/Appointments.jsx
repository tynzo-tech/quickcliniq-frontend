import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  CalendarCheck,
  Loader2,
  RefreshCw,
  Search,
  Stethoscope
} from "lucide-react";

import Layout
from "../../components/Layout";

import {
  apiUrl
} from "../../config/api";


function StatCard({
  icon: Icon,
  label,
  value,
  tone = "slate"
}) {

  const tones = {
    slate: "bg-slate-100 text-slate-800",
    teal: "bg-teal-50 text-teal-700",
    cyan: "bg-cyan-50 text-cyan-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}


function statusClass(status) {

  const normalized =
    String(status || "").toLowerCase();

  if (
    normalized.includes("book")
    || normalized.includes("confirm")
  ) {

    return "bg-teal-50 text-teal-700";
  }

  if (normalized.includes("cancel")) {

    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}


export default function Appointments() {

  const clinicId =
    localStorage.getItem(
      "clinic_id"
    );

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const fetchAppointments =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await axios.get(
            apiUrl("/appointments"),
            {
              params: {
                clinic_id: clinicId
              }
            }
          );

        setAppointments(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to load appointments"
        );

      } finally {

        setLoading(false);
      }
    }, [clinicId]);

  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        fetchAppointments();

      }, 0);

    return () =>
      window.clearTimeout(timer);

  }, [fetchAppointments]);

  const statusOptions =
    useMemo(() => [
      "all",
      ...new Set(
        appointments
          .map((appointment) => appointment.status)
          .filter(Boolean)
      )
    ], [appointments]);

  const filteredAppointments =
    useMemo(() => {

      const normalizedQuery =
        query.trim().toLowerCase();

      return appointments.filter((appointment) => {

        const matchesStatus =
          statusFilter === "all"
          || appointment.status === statusFilter;

        const searchable = [
          appointment.patient_name,
          appointment.phone_number,
          appointment.doctor_name,
          appointment.problem,
          appointment.appointment_date,
          appointment.appointment_time
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesStatus
          && (
            !normalizedQuery
            || searchable.includes(normalizedQuery)
          );
      });

    }, [
      appointments,
      query,
      statusFilter
    ]);

  const confirmedCount =
    appointments.filter((appointment) =>
      String(appointment.status || "")
        .toLowerCase()
        .includes("book")
    ).length;

  const doctorCount =
    new Set(
      appointments
        .map((appointment) => appointment.doctor_name)
        .filter(Boolean)
    ).size;

  return (
    <Layout
      title="Appointments"
      subtitle="Search, filter, and review patient bookings from one clean workspace."
      actions={(
        <button
          type="button"
          onClick={fetchAppointments}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-slate-950 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      )}
    >
      {error && (
        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={CalendarCheck}
          label="Total appointments"
          value={appointments.length}
          tone="slate"
        />
        <StatCard
          icon={CalendarCheck}
          label="Confirmed"
          value={confirmedCount}
          tone="teal"
        />
        <StatCard
          icon={Stethoscope}
          label="Doctors"
          value={doctorCount}
          tone="cyan"
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Appointment list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredAppointments.length} of {appointments.length} appointments.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100 sm:w-72">
              <Search
                size={17}
                className="shrink-0 text-slate-400"
              />
              <input
                type="search"
                placeholder="Search appointments"
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            >
              {statusOptions.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "all" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              No appointments found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing the search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Problem</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">
                        {appointment.patient_name || "Patient"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {appointment.phone_number || "No phone number"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {appointment.doctor_name || "Doctor"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {appointment.appointment_date || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {appointment.appointment_time || "-"}
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-600">
                      <span className="line-clamp-2">
                        {appointment.problem || "Not provided"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClass(appointment.status)}`}>
                        {appointment.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
