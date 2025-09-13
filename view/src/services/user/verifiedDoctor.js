import API from "../../api/api";

export const getAllDoctors = async (data) => {
  const res = await API.post("/auth/all", data);
  return res.data;
};