import React, { useState, useEffect } from "react";
import { Box, TextField, Button, MenuItem, Typography, Snackbar, Alert, Paper } from "@mui/material";
import { motion } from "framer-motion";

export default function ReminderForm({ reminder = null, onSaved }) {
  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    time: "",
    repeat: "None",
    notes: "",
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (reminder) {
      setFormData({
        medicineName: reminder.medicineName || "",
        dosage: reminder.dosage || "",
        time: reminder.time ? reminder.time.slice(0, 16) : "",
        repeat: reminder.repeat || "None",
        notes: reminder.notes || "",
      });
    }
  }, [reminder]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSaved) return;

    try {
      onSaved(formData);
      setFormData({ medicineName: "", dosage: "", time: "", repeat: "None", notes: "" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to save reminder", severity: "error" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 4,
          "&:hover": { boxShadow: 8, transform: "translateY(-2px)", transition: "0.3s" },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", mb: 3, textAlign: "center" }}>
          {reminder ? "Edit Reminder" : "New Reminder"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Medicine Name"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            required
          />
          <TextField
            label="Time"
            name="time"
            type="datetime-local"
            value={formData.time}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Repeat"
            name="repeat"
            select
            value={formData.repeat}
            onChange={handleChange}
          >
            {["None", "Daily", "Weekly"].map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            sx={{ gridColumn: "span 2" }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ gridColumn: "span 2", mt: 1 }}>
            {reminder ? "Update Reminder" : "Create Reminder"}
          </Button>
        </Box>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    </motion.div>
  );
}
