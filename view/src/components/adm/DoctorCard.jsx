import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

const DoctorCard = ({ doctor, onVerify }) => {
  return (
    <Card className="rounded-2xl shadow-md mb-4">
      <CardContent>
        <Typography variant="h6">{doctor.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {doctor.email}
        </Typography>
        <Typography variant="body2">
          Status: {doctor.verificationStatus || "Pending"}
        </Typography>

        <Stack direction="row" spacing={2} mt={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => onVerify(doctor._id, "approve")}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onVerify(doctor._id, "reject")}
          >
            Reject
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
