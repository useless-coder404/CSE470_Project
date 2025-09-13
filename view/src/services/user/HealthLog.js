import API from "../../api/api";

export const getHealthLogs = async () => {
  const response = await API.get("/auth/healthlogs");
  return response.data.data;
};

export const createHealthLog = async (data) => {
  const response = await API.post("/auth/healthlogs", data);
  return response.data.data;
};

export const updateHealthLog = async (id, data) => {
  const response = await API.patch(`/auth/healthlogs/${id}`, data);
  return response.data.data;
};

export const deleteHealthLog = async (id) => {
  const response = await API.delete(`/auth/healthlogs/${id}`);
  return response.data.success;
};
