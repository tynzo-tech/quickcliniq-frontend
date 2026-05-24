import {
  useEffect,
  useState
} from "react";

import {
  createShift,
  getShifts,
  toggleShift
} from "../services/slotApi";

import Layout
from "../../components/Layout";


const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun"
];


export default function ShiftManagement() {

  const clinic = JSON.parse(
    localStorage.getItem("clinic")
  );

  const [shifts, setShifts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      start_time: "09:00",
      end_time: "17:00",
      break_start: "",
      break_end: "",
      slot_duration: 10
    });


  useEffect(() => {

    loadShifts();

  }, []);


  const loadShifts =
  async () => {

    if (!clinic?.id) {

      setLoading(false);
      setError("Clinic session not found");
      return;
    }

    try {

      setLoading(true);
      setError("");

      const data =
        await getShifts(
          clinic.id
        );

      setShifts(data);

    } catch (error) {

      console.log(error);
      setError("Failed to load shifts");

    } finally {

      setLoading(false);
    }
  };


  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };


  const toggleDay = (day) => {

    const selected =
      formData.working_days.includes(day);

    setFormData({
      ...formData,
      working_days: selected
        ? formData.working_days.filter(
            (item) => item !== day
          )
        : [...formData.working_days, day]
    });
  };


  const handleAddShift =
  async () => {

    try {

      await createShift({
        clinic_id: clinic.id,
        doctor_name: clinic.doctor_name,
        working_days: formData.working_days,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_start: formData.break_start || null,
        break_end: formData.break_end || null,
        slot_duration: Number(formData.slot_duration)
      });

      await loadShifts();

    } catch (error) {

      console.log(error);
      setError("Failed to create shift");
    }
  };


  const handleToggle =
  async (shiftId) => {

    try {

      await toggleShift(shiftId);
      await loadShifts();

    } catch (error) {

      console.log(error);
      setError("Failed to update shift");
    }
  };


  return (

    <Layout
      title="Shift Management"
      subtitle="Create and manage dynamic clinic schedules."
    >

      {loading && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
          Loading shifts...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-red-600 rounded-3xl p-6 mb-6 shadow-sm">
          {error}
        </div>
      )}

      {!loading && (
        <>
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="border border-gray-200 rounded-2xl px-4 py-3 outline-none"
              />

              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="border border-gray-200 rounded-2xl px-4 py-3 outline-none"
              />

              <input
                type="time"
                name="break_start"
                value={formData.break_start}
                onChange={handleChange}
                className="border border-gray-200 rounded-2xl px-4 py-3 outline-none"
              />

              <input
                type="time"
                name="break_end"
                value={formData.break_end}
                onChange={handleChange}
                className="border border-gray-200 rounded-2xl px-4 py-3 outline-none"
              />

              <input
                type="number"
                name="slot_duration"
                min="1"
                max="240"
                value={formData.slot_duration}
                onChange={handleChange}
                className="border border-gray-200 rounded-2xl px-4 py-3 outline-none"
              />

              <button
                onClick={handleAddShift}
                className="bg-black text-white rounded-2xl px-5 py-3 hover:opacity-90 transition"
              >
                Save Shift
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`
                    px-4 py-2 rounded-2xl text-sm
                    ${
                      formData.working_days.includes(day)
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700"
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Days</th>
                    <th className="px-6 py-4">Hours</th>
                    <th className="px-6 py-4">Break</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {shifts.map((shift) => (
                    <tr
                      key={shift.id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-6 py-5 font-medium">
                        {shift.doctor_name}
                      </td>
                      <td className="px-6 py-5">
                        {shift.working_days}
                      </td>
                      <td className="px-6 py-5">
                        {shift.start_time} - {shift.end_time}
                      </td>
                      <td className="px-6 py-5">
                        {shift.break_start || "-"} - {shift.break_end || "-"}
                      </td>
                      <td className="px-6 py-5">
                        {shift.slot_duration} min
                      </td>
                      <td className="px-6 py-5">
                        {shift.is_active ? "Active" : "Inactive"}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleToggle(shift.id)}
                          className="px-4 py-2 rounded-2xl bg-black text-white hover:opacity-90 transition"
                        >
                          {shift.is_active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </Layout>
  );
}

