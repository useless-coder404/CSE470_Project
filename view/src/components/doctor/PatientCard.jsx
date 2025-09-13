import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

const PatientCard = ({ patient }) => {
  return (
    <Card className="rounded-2xl shadow-md mb-4">
      <CardContent>
        <Typography variant="h6">{patient.name}</Typography>
        <Typography variant="body2" color="text.secondary">{patient.email}</Typography>
        <Typography variant="body2">Age: {patient.age || "-"}</Typography>
        <Typography variant="body2">Gender: {patient.gender || "-"}</Typography>
        <Stack direction="row" spacing={2} mt={2}>
          <Button variant="contained" size="small" onClick={() => window.location.href=`/doctor/patients/${patient._id}`}>
            View Details
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
