import React, { useState } from "react";
import { Box, Typography, Snackbar, Alert, Grid } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from '@mui/icons-material'
import { motion } from "framer-motion";
import { addHospital } from "../../services/admin/adminHospitalService";
import HospitalCard from "../../components/adm/HospitalCard";
import Sidebar from "../../components/adm/Sidebar";
import Header from "../../components/adm/Header";
import Footer from "../../components/home/Footer";

export default function Hospitals() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [notifications, setNotifications] = useState([]);

  const sidebarLinks = [
    { title: "Dashboard", link: "/admin" },
    { title: "Doctor Management", link: "/admin/doctors" },
    { title: "User Management", link: "/admin/users" },
    { title: "Hospitals", link: "/admin/hospitals" },
    { title: "Logs", link: "/admin/logs" },
    { title: "Notifications", link: "/admin/notifications" },
    { title: "System Settings", link: "/admin/system-settings" },
  ];

  const handleAddHospital = async (data) => {
    try {
      await addHospital(data);
      setSnackbar({
        open: true,
        message: "Hospital added successfully",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to add hospital",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarTitle={
          < Box sx={{ display: "flex", alignItems: "center",gap: 1, mb: 2}}>
            <HealthAndSafetyIcon sx={{ color: "#1976d2", fontSize: 28 }} />
              <Typography variant="h6" 
                sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}
              > 
                Health Assistant
              </Typography>
          </Box>
        }
        sidebarLinks={sidebarLinks}
      />

      {/* Main content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? 30 : 0,
          transition: "all 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={notifications} />

        <Box sx={{ flex: 1, p: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                mb: 3,
                textAlign: "center",
              }}
            >
              Hospitals Management
            </Typography>
          </motion.div>

          <Grid container spacing={3} direction="column">
            <Grid item>
              <HospitalCard onAdd={handleAddHospital} />
            </Grid>
          </Grid>
        </Box>

        <Footer />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
