import API from "../../api/api";

export const uploadPrescription = async (file, description) => {
  const formData = new FormData();
  formData.append("prescription", file);
  formData.append("description", description || "");

  const res = await API.post("/auth/prescriptions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.prescription;
};

export const extractPrescriptionText = async (file) => {
  const formData = new FormData();
  formData.append("prescription", file);

  const res = await API.post("/auth/prescriptions/ocr", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.text;
};

export const getPrescriptions = async () => {
  const res = await API.get("/auth/prescriptions");
  return res.data.prescriptions || [];
};

export const getPrescriptionFileUrl = (fileUrl) => {
  return `${process.env.REACT_APP_API_URL}${fileUrl}`;
};

