
import React, { useState } from "react";
import { Box, Typography, Button, Grid, CircularProgress } from "@mui/material";
import api from "../../api/api";
import DoctorCard from "../../components/doctor/DoctorCard";

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNearbyDoctors = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await api.get("/auth/nearby", {
            params: { lat: latitude, lng: longitude, radius: 10 },
          });
          setDoctors(res.data.doctors);
        } catch (err) {
          setError("Failed to fetch nearest doctors. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Permission denied. Cannot access location.");
        setLoading(false);
      }
    );
  };

  const fetchAllDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/auth/public");
      setDoctors(res.data.doctors);
    } catch (err) {
      setError("Failed to fetch all doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 8, px: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Find Verified Doctors
      </Typography>

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchNearbyDoctors}
        >
          Find Doctors Near Me
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={fetchAllDoctors}
        >
          See All Verified Doctors
        </Button>
      </Box>

      {/* Loading and Error */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography variant="body1" color="error" align="center" sx={{ mb: 4 }}>
          {error}
        </Typography>
      )}

      {/* Doctor Cards */}
      <Grid container spacing={2}>
        {doctors.map((doc) => (
          <Grid item xs={12} md={4} key={doc._id}>
            <DoctorCard doctor={doc} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DoctorSearch;