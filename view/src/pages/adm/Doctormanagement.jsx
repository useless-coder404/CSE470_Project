import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from '@mui/icons-material'
import { motion } from "framer-motion";
import { getPendingDoctors, verifyDoctor } from "../../services/admin/adminDoctorService";
import DoctorCard from "../../components/adm/DoctorCard";
import Sidebar from "../../components/adm/Sidebar";
import Header from "../../components/adm/Header";
import Footer from "../../components/home/Footer";

export default function DoctorManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { title: "Dashboard", link: "/admin" },
    { title: "Doctor Management", link: "/admin/doctors" },
    { title: "User Management", link: "/admin/users" },
    { title: "Hospitals", link: "/admin/hospitals" },
    { title: "Logs", link: "/admin/logs" },
    { title: "Notifications", link: "/admin/notifications" },
    { title: "System Settings", link: "/admin/system-settings" },
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getPendingDoctors();
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error("Error fetching pending doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, action) => {
    try {
      await verifyDoctor(id, action);
      fetchDoctors();
    } catch (err) {
      console.error("Verification error", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

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

      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? 30 : 0,
          transition: "all 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={[]} />

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
              Pending Doctors
            </Typography>
          </motion.div>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3} direction="column">
              {doctors.length ? (
                doctors.map((doctor) => (
                  <Grid item key={doctor._id}>
                    <DoctorCard doctor={doctor} onVerify={handleVerify} />
                  </Grid>
                ))
              ) : (
                <Typography
                  variant="body1"
                  sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
                >
                  No pending doctors at the moment.
                </Typography>
              )}
            </Grid>
          )}
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
