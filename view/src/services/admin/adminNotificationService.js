import API from "../../api/api";

export const sendNotification = async (data) => {
  const res = await API.get("/admin/notify", data);
  return res.data;
};