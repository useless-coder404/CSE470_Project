import React from "react";
import { Paper, Typography, Button, Box } from "@mui/material";

export default function AppointmentCard({ appointment, onReschedule, onCancel }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">{appointment.doctor?.name || "Doctor"}</Typography>
      <Typography variant="body2" color="text.secondary">
        {new Date(appointment.date).toLocaleString()}
      </Typography>
      <Typography variant="body2">Status: {appointment.status}</Typography>

      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Button size="small" variant="outlined" onClick={() => onReschedule(appointment)}>
          Reschedule
        </Button>
        <Button size="small" color="error" variant="contained" onClick={() => onCancel(appointment._id)}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}
