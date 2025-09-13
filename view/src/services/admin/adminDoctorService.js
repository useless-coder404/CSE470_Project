import API from "../../api/api";

export const getPendingDoctors = async () => {
  const res = await API.get("/admin/doctors/pending");
  return res.data;
};

export const verifyDoctor = async (id, action) => {
  const res = await API.patch(`/admin/doctors/${id}/verify`, { action });
  return res.data;
};

export const getAllDoctors = async (params) => {
  const res = await API.get("/admin/doctors", { params });
  return res.data;
};
