import API from "../../api/api";

export const addHospital = async (data) => {
  const res = await API.get("/admin/hospital", data);
  return res.data;
};