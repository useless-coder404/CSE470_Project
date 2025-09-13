import API from "../../api/api";

export const getSystemSettings = async () => {
  const res = await API.get("/admin/system-settings");
  return res.data;
};

export const updateSystemSettings = async (data) => {
  const res = await API.get("/admin/system-settings", data);
  return res.data;
};