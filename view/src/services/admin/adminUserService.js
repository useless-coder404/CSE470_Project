import API from "../../api/api";

export const getAllUsers = async (params) => {
  const res = await API.get("/admin/users", { params });
  return res.data;
};

export const blockUser = async (id) => {
  const res = await API.patch(`/admin/users/${id}/block`);
  return res.data;
};

export const unblockUser = async (id) => {
  const res = await API.patch(`/admin/users/${id}/unblock`);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await API.delete(`/admin/users/${id}`);
  return res.data;
};