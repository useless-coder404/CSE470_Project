import API from "../../api/api";

export const getPatientsList = async () => {
  const res = await API.get("/doctor/patients");
  return res.data;
};

export const getPatientById = async (id) => {
  const res = await API.get(`/doctor/patients/${id}`);
  return res.data;
};

export const getAppointmentsList = async () => {
  const res = await API.get("/doctor/appointments");
  return res.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const res = await API.patch(`/doctor/appointments/${id}`, { status });
  return res.data;
};
