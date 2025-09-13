import React from "react";
import { Card, CardContent, Typography, Button, Box, Avatar, Stack } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";

const DoctorCard = ({ doctor }) => {
  const name = doctor.name || doctor.userId?.name || doctor.doctorProfile?.name || "Unknown Doctor";
  const specialty = doctor.doctorProfile?.specialty || doctor.specialty || "General";
  const clinicLocation = doctor.doctorProfile?.clinicLocation || doctor.clinicLocation;
  const rating = doctor.doctorProfile?.rating || doctor.rating;
  const distance = doctor.distance;

  return (
    <Card
      sx={{
        mb: 2,
        transition: "0.3s",
        "&:hover": { boxShadow: 6 },
        background: "linear-gradient(145deg, #e3f2fd, #ffffff)",
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          <Avatar
            src="/doctor-placeholder.png"
            alt={name}
            sx={{ width: 56, height: 56 }}
          />
          <Box>
            <Typography variant="h6">{name}</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocalHospitalIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {specialty}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {clinicLocation?.coordinates && (
          <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Lat: {clinicLocation.coordinates[1].toFixed(3)}, Lng:{" "}
              {clinicLocation.coordinates[0].toFixed(3)}
            </Typography>
          </Stack>
        )}

        {distance && (
          <Typography variant="body2" color="text.secondary">
            Distance: {distance.toFixed(2)} km
          </Typography>
        )}

        {rating !== undefined && (
          <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
            <StarIcon fontSize="small" color="warning" />
            <Typography variant="body2" color="text.secondary">
              {rating.toFixed(1)}
            </Typography>
          </Stack>
        )}

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" fullWidth>
            Book Appointment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;