import API from "../../api/api";

export const uploadDocuments = async (formData) => {
  const res = await API.post("/doctor/upload-docs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getDoctorStatus = async () => {
  const res = await API.get("/doctor/status");
  return res.data;
};
