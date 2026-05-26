import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  Users
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
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}


function formatDate(value) {

  if (!value) {

    return "-";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {

    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );
}


export default function Patients() {

  const [patients, setPatients] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [genderFilter, setGenderFilter] =
    useState("all");

  const fetchPatients =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await axios.get(
            apiUrl("/patients"),
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
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (error) {

        console.log(error);

        setError(
          error.response?.data?.detail ||
            "Failed to load patients"
        );

      } finally {

        setLoading(false);
      }
    }, []);

  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        fetchPatients();

      }, 0);

    return () =>
      window.clearTimeout(timer);

  }, [fetchPatients]);

  const genderOptions =
    useMemo(() => [
      "all",
      ...new Set(
        patients
          .map((patient) => patient.gender)
          .filter(Boolean)
      )
    ], [patients]);

  const filteredPatients =
    useMemo(() => {

      const normalizedSearch =
        search.trim().toLowerCase();

      return patients.filter((patient) => {

        const matchesGender =
          genderFilter === "all"
          || patient.gender === genderFilter;

        const searchable = [
          patient.name,
          patient.phone_number,
          patient.gender,
          patient.age,
          patient.created_at
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesGender
          && (
            !normalizedSearch
            || searchable.includes(normalizedSearch)
          );
      });

    }, [
      patients,
      search,
      genderFilter
    ]);

  const withPhoneCount =
    patients.filter((patient) => patient.phone_number).length;

  const averageAge =
    patients.length
      ? Math.round(
          patients.reduce(
            (total, patient) =>
              total + Number(patient.age || 0),
            0
          ) / patients.length
        )
      : 0;

  return (
    <Layout
      title="Patients"
      subtitle="Browse patient records with fast search and clean clinic-friendly filters."
      actions={(
        <button
          type="button"
          onClick={fetchPatients}
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

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total patients"
          value={patients.length}
        />
        <StatCard
          icon={UserCheck}
          label="With phone number"
          value={withPhoneCount}
          tone="teal"
        />
        <StatCard
          icon={Users}
          label="Average age"
          value={averageAge || "-"}
          tone="cyan"
        />
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Patient list
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Showing {filteredPatients.length} of {patients.length} patients.
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
                placeholder="Search patients"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={genderFilter}
              onChange={(event) =>
                setGenderFilter(
                  event.target.value
                )
              }
              className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            >
              {genderOptions.map((gender) => (
                <option
                  key={gender}
                  value={gender}
                >
                  {gender === "all" ? "All genders" : gender}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto mb-3 animate-spin text-teal-600" />
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              No patients found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing the search or gender filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Age</th>
                  <th className="px-5 py-3 font-semibold">Gender</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {patient.name || "Patient"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {patient.age || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {patient.gender || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {patient.phone_number || "No phone number"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(patient.created_at)}
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
