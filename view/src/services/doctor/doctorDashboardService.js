import API from "../../api/api";

export const getDashboardStats = async () => {
  const res = await API.get("/doctor/dashboard/stats");
  return res.data;
};

export const getRecentAppointments = async (params) => {
  const res = await API.get("/doctor/appointments", { params });
  return res.data;
};

export const getPatients = async () => {
  const res = await API.get("/doctor/patients");
  return res.data;
};
