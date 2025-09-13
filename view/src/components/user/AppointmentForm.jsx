import React, { useState, useEffect } from "react";
import { Box, TextField, Button, MenuItem } from "@mui/material";
import { getAllDoctors } from "../../services/user/verifiedDoctor";

export default function AppointmentForm({ onSubmit }) {
  const [form, setForm] = useState({ doctorId: "", date: "" });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date) return;
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        select
        label="Select Doctor"
        name="doctorId"
        value={form.doctorId}
        onChange={handleChange}
        fullWidth
        margin="normal"
      >
        {doctors.map((doc) => (
          <MenuItem key={doc._id} value={doc._id}>
            {doc.name} ({doc.specialization})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        type="datetime-local"
        label="Appointment Date"
        name="date"
        value={form.date}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <Button type="submit" variant="contained" color="primary">
        Book Appointment
      </Button>
    </Box>
  );
}
