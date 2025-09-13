import React, { useState } from "react";
import { Box, Typography, Button, TextField, Stack, Alert } from "@mui/material";
import { uploadDocuments } from "../../services/doctor/doctorDocumentService";

export default function UploadDocumentForm() {
  const [formFiles, setFormFiles] = useState({ idCard: null, certificate: null });
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFormFiles({ ...formFiles, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async () => {
    if (!formFiles.idCard || !formFiles.certificate) {
      setMessage({ text: "Please upload all required documents.", type: "error" });
      return;
    }
    const formData = new FormData();
    formData.append("idCard", formFiles.idCard);
    formData.append("certificate", formFiles.certificate);

    try {
      setLoading(true);
      const res = await uploadDocuments(formData);
      setMessage({ text: res.message || "Documents uploaded successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Failed to upload documents.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
      {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      <Stack spacing={3}>
        <Box>
          <Typography>ID Card / License</Typography>
          <Button variant="contained" component="label">
            Upload
            <input type="file" hidden name="idCard" onChange={handleFileChange} accept="image/*,application/pdf" />
          </Button>
          {formFiles.idCard && <Typography variant="body2" sx={{ mt: 1 }}>{formFiles.idCard.name}</Typography>}
        </Box>

        <Box>
          <Typography>Medical Certificate / Degree</Typography>
          <Button variant="contained" component="label">
            Upload
            <input type="file" hidden name="certificate" onChange={handleFileChange} accept="image/*,application/pdf" />
          </Button>
          {formFiles.certificate && <Typography variant="body2" sx={{ mt: 1 }}>{formFiles.certificate.name}</Typography>}
        </Box>

        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Uploading..." : "Submit Documents"}
        </Button>
      </Stack>
    </Box>
  );
}
