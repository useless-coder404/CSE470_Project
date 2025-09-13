import API from "../../api/api";

export const getDoctorProfile = async () => {
  const res = await API.get("/doctor/profile");
  return res.data;
};

export const updateDoctorProfile = async (data) => {
  const res = await API.patch("/doctor/update-profile", data);
  return res.data;
};

export const changeDoctorPassword = async (data) => {
  const res = await API.patch("/doctor/change-password", data);
  return res.data;
};

export const toggleDoctor2FA = async () => {
  const res = await API.patch("/doctor/toggle-2fa");
  return res.data;
};
