import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

const AppointmentCard = ({ appointment, onUpdateStatus }) => {
  return (
    <Card className="rounded-2xl shadow-md mb-4">
      <CardContent>
        <Typography variant="h6">Patient: {appointment.patientName}</Typography>
        <Typography variant="body2">Date: {new Date(appointment.date).toLocaleDateString()}</Typography>
        <Typography variant="body2">Time: {appointment.time || "-"}</Typography>
        <Typography variant="body2">Status: {appointment.status}</Typography>
        <Stack direction="row" spacing={2} mt={2}>
          <Button variant="contained" color="success" size="small" onClick={() => onUpdateStatus(appointment._id, "Approved")}>Approve</Button>
          <Button variant="outlined" color="error" size="small" onClick={() => onUpdateStatus(appointment._id, "Rejected")}>Reject</Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
