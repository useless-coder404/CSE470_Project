import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import OverviewCard from "../../components/doctor/OverviewCard";
import QuickActionButton from "../../components/doctor/QuickActionButton";
import { getDashboardStats, getRecentAppointments, getPatients } from "../../services/doctor/doctorDashboardService";

export default function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const sidebarLinks = [
    { title: "Dashboard", link: "/doctor" },
    { title: "Profile", link: "/doctor/profile" },
    { title: "Appointments", link: "/doctor/appointments" },
    { title: "Patients", link: "/doctor/patients" },
    { title: "Upload Documents", link: "/doctor/upload-docs" },
  ];

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, apptRes, patientRes] = await Promise.all([
        getDashboardStats(),
        getRecentAppointments(),
        getPatients(),
      ]);
      setStats(statsRes || {});
      setAppointments(apptRes || []);
      setPatients(patientRes || []);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const statMap = {
    totalPatients: "Total Patients",
    upcomingAppointments: "Upcoming Appointments",
    pendingRequests: "Pending Requests",
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar sidebarOpen={sidebarOpen} sidebarTitle={
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 2 }}>Doctor Panel</Typography>
      } sidebarLinks={sidebarLinks} />

      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={[]} />

        <Box sx={{ flex: 1, p: 3 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 3, textAlign: "center" }}>
              Dashboard Overview
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {/* Overview Cards */}
            {Object.entries(statMap).map(([key, title]) => (
              <Grid item xs={12} sm={4} key={key}>
                <OverviewCard title={title} value={stats[key] || 0} />
               </Grid>
              ))}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item><QuickActionButton label="View Appointments" onClick={() => window.location.href="/doctor/appointments"} /></Grid>
              <Grid item><QuickActionButton label="View Patients" onClick={() => window.location.href="/doctor/patients"} /></Grid>
              <Grid item><QuickActionButton label="Upload Documents" onClick={() => window.location.href="/doctor/upload-docs"} color="secondary"/></Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Appointments</Typography>
            {appointments.length ? (
              <Grid container spacing={2}>
                {appointments.slice(0,5).map((appt) => (
                  <Grid item xs={12} sm={6} key={appt._id}>
                    <Paper sx={{ p:2, borderRadius:2 }}>
                      <Typography variant="subtitle2">Patient: {appt.patientName}</Typography>
                      <Typography variant="body2">Date: {new Date(appt.date).toLocaleDateString()}</Typography>
                      <Typography variant="body2">Status: {appt.status}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No recent appointments</Typography>
            )}
          </Box>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
