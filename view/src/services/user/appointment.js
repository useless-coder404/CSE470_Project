import API from "../../api/api";

export const getAppointments = async () => {
  const res = await API.get("/auth/appointments/my");
  return res.data.results || [];
};

export const bookAppointment = async (data) => {
  const res = await API.post("/auth/appointments", data);
  return res.data;
};

export const rescheduleAppointment = async (id, newDate) => {
  const res = await API.patch(`/auth/appointments/${id}/reschedule`, { date: newDate });
  return res.data;
};

export const cancelAppointment = async (id) => {
  const res = await API.delete(`/auth/appointments/${id}/cancel`);
  return res.data;
};
