import React, { useState } from "react";
import { Paper, Typography, Box, Button, Dialog, DialogContent } from "@mui/material";
import { extractPrescriptionText } from "../../services/user/Prescription";

export default function PrescriptionCard({ prescription }) {
  const [open, setOpen] = useState(false);
  const [ocrText, setOcrText] = useState("");

  const handleView = async () => {
    try {
      const res = await extractPrescriptionText(prescription.fileUrl);
      setOcrText(res.data.text);
      setOpen(true);
    } catch (error) {
      console.error("OCR failed:", error);
      setOcrText("Failed to extract text.");
      setOpen(true);
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }} elevation={2}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {prescription.description || "No Description"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uploaded At: {new Date(prescription.uploadedAt).toLocaleString()}
          </Typography>

          <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
            {/* View Button (OCR) */}
            <Button variant="contained" color="primary" onClick={handleView}>
              View
            </Button>

            {/* Download Button */}
            <a
              href={prescription.fileUrl}
              download
              style={{ textDecoration: "none" }}
            >
              <Button variant="outlined" color="secondary">
                Download
              </Button>
            </a>
          </Box>
        </Box>
      </Box>

      {/* Dialog to show OCR text */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6">Prescription OCR Text</Typography>
          <Typography variant="body2" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
            {ocrText}
          </Typography>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
