import React, { useState } from "react";
import { Box, TextField, Button, Snackbar, Alert, CircularProgress } from "@mui/material";

export default function PrescriptionForm({ onUpload }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setSnackbar({ open: true, message: "Please select a file", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      await onUpload(file, description);
      setFile(null);
      setDescription("");
      setSnackbar({ open: true, message: "Prescription uploaded successfully", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Upload failed", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
      <TextField type="file" onChange={handleFileChange} inputProps={{ accept: ".pdf,image/*" }} required />
      <TextField label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Upload Prescription"}
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
