import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, Stack } from "@mui/material";

const HospitalCard = ({ onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    lat: "",
    lng: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.name || !form.lat || !form.lng) return;
    setLoading(true);
    try {
      await onAdd(form);
      setForm({ name: "", address: "", phone: "", email: "", lat: "", lng: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent>
        <Typography variant="h6" mb={2} color="primary.main">
          Add Hospital
        </Typography>
        <Stack spacing={2}>
          <TextField label="Hospital Name" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth />
          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
          <TextField label="Latitude" name="lat" value={form.lat} onChange={handleChange} fullWidth />
          <TextField label="Longitude" name="lng" value={form.lng} onChange={handleChange} fullWidth />
          <Button variant="contained" color="primary" onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add Hospital"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default HospitalCard;
