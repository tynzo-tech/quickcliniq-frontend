import axios from "axios";

const BASE_URL =
  import.meta.env
    .VITE_API_URL;


export const getShifts =
async (clinicId) => {

  const response =
    await axios.get(
      `${BASE_URL}/shifts/${clinicId}`
    );

  return response.data;
};


export const createShift =
async (data) => {

  const response =
    await axios.post(
      `${BASE_URL}/shifts`,
      data
    );

  return response.data;
};


export const toggleShift =
async (shiftId) => {

  const response =
    await axios.put(
      `${BASE_URL}/shifts/${shiftId}/toggle`
    );

  return response.data;
};


export const getAvailableSlots =
async ({
  clinicId,
  doctorName,
  appointmentDate
}) => {

  const response =
    await axios.get(
      `${BASE_URL}/available-slots`,
      {
        params: {
          clinic_id: clinicId,
          doctor_name: doctorName,
          appointment_date: appointmentDate
        }
      }
    );

  return response.data;
};

