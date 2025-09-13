import React from "react";
import { Paper, Typography } from "@mui/material";

export default function DoctorStatCard({ label, value }) {
  return (
    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 3 }} elevation={3}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Paper>
  );
}
