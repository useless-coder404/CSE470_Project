import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from "@mui/material";

const HealthLogForm = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    symptoms: "",
    mood: "",
    notes: "",
    height: "",
    weight: "",
    temperature: "",
    heartRate: "",
    bloodPressure: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        symptoms: initialData.symptoms?.join(", ") || "",
        mood: initialData.mood || "",
        notes: initialData.notes || "",
        height: initialData.height || "",
        weight: initialData.weight || "",
        temperature: initialData.vitals?.temperature || "",
        heartRate: initialData.vitals?.heartRate || "",
        bloodPressure: initialData.vitals?.bloodPressure || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      symptoms: form.symptoms.split(",").map((s) => s.trim()).filter(Boolean),
      height: form.height !== "" ? Number(form.height) : null,
      weight: form.weight !== "" ? Number(form.weight) : null,
      vitals: {
        temperature: form.temperature !== "" ? Number(form.temperature) : null,
        heartRate: form.heartRate !== "" ? Number(form.heartRate) : null,
        bloodPressure: form.bloodPressure || null,
      }
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Update Health Log" : "Add Health Log"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Symptoms (comma separated)" name="symptoms" value={form.symptoms} onChange={handleChange} fullWidth />
          <TextField label="Mood" name="mood" value={form.mood} onChange={handleChange} fullWidth />
          <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} fullWidth multiline rows={3} />
          <Stack direction="row" spacing={2}>
            <TextField label="Height (cm)" name="height" value={form.height} onChange={handleChange} type="number" fullWidth />
            <TextField label="Weight (kg)" name="weight" value={form.weight} onChange={handleChange} type="number" fullWidth />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Temperature (°C)" name="temperature" value={form.temperature} onChange={handleChange} type="number" fullWidth />
            <TextField label="Heart Rate" name="heartRate" value={form.heartRate} onChange={handleChange} type="number" fullWidth />
            <TextField label="Blood Pressure" name="bloodPressure" value={form.bloodPressure} onChange={handleChange} fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">{initialData ? "Update" : "Add"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HealthLogForm;
