import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Paper, Snackbar, Alert } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import PrescriptionForm from "../../components/user/PrescriptionForm";
import PrescriptionCard from "../../components/user/PrescriptionCard";
import { uploadPrescription, getPrescriptions } from "../../services/user/Prescription";

export default function PrescriptionReaderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchAllPrescriptions();
  }, []);

  const sidebarLinks = [
    { title: "Profile", link: "/user/profile" },
    { title: "Health Log", link: "/user/healthlogs" },
    { title: "Reminder", link: "/user/reminders" },
    { title: "Appointment", link: "/user/appointments" },
    { title: "Emergency", link: "/user/emergency" },
    { title: "AI Diagnostics", link: "/user/ai" },
    { title: "Prescription Reader", link: "/user/prescriptions" },
  ];

  const fetchAllPrescriptions = async () => {
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to fetch prescriptions",
        severity: "error",
      });
    }
  };

  const handleUpload = async (file, description) => {
    try {
      const uploaded = await uploadPrescription(file, description);
      setPrescriptions([uploaded, ...prescriptions]);
      setSnackbar({
        open: true,
        message: "Prescription uploaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload prescription",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarTitle={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <HealthAndSafetyIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}
            >
              Health Assistant
            </Typography>
          </Box>
        }
        sidebarLinks={sidebarLinks}
      />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? 30 : 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
        />

        <Box sx={{ flex: 1, p: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
              Prescription Reader
            </Typography>
          </motion.div>

          {/* Upload Form */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} elevation={4}>
            <PrescriptionForm onUpload={handleUpload} />
          </Paper>

          {/* Prescription Cards */}
          <Grid container spacing={2} direction="column">
            {prescriptions.length === 0 ? (
              <Typography>No prescriptions uploaded yet.</Typography>
            ) : (
              prescriptions.map((presc) => (
                <PrescriptionCard key={presc._id} prescription={presc} />
              ))
            )}
          </Grid>
        </Box>

        <Footer />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
