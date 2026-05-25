import axios from "axios";

import {
  API_BASE_URL
} from "../../config/api";

const BASE_URL =
  API_BASE_URL;


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


export const updateShift =
async (
  shiftId,
  data
) => {

  const response =
    await axios.put(
      `${BASE_URL}/shifts/${shiftId}`,
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


export const getUnavailableTimes =
async (clinicId) => {

  const response =
    await axios.get(
      `${BASE_URL}/doctor-unavailable/${clinicId}`
    );

  return response.data;
};


export const createUnavailableTime =
async (data) => {

  const response =
    await axios.post(
      `${BASE_URL}/doctor-unavailable`,
      data
    );

  return response.data;
};


export const deleteUnavailableTime =
async (unavailableId) => {

  const response =
    await axios.delete(
      `${BASE_URL}/doctor-unavailable/${unavailableId}`
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
