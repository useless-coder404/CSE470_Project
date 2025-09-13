import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import axios from "../../api/api";
import Sidebar from "../../components/adm/Sidebar";
import Header from "../../components/adm/Header";
import Footer from "../../components/home/Footer";
import DashboardCards from "../../components/adm/DashboardCards";
import QuickAccess from "../../components/adm/QuickAccess";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({ pendingDoctors: null, allDoctors: null, users: null, hospitals: null, approvedAppointments: null });
  const [notifications, setNotifications] = useState([]);
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

  const fetchDashboardData = async () => {
    try {
      const [pendingRes, doctorsRes, usersRes, hospitalsRes, appointmentsRes, notificationsRes] =
        await Promise.all([
          axios.get("/admin/doctors/pending"),
          axios.get("/admin/doctors"),
          axios.get("/admin/users"),
          axios.get("/admin/hospital"),
          axios.get("/admin/appointments/approved"),
          axios.get("/admin/notifications"),
        ]);

      setCounts({
        pendingDoctors: pendingRes.data.results,
        allDoctors: doctorsRes.data.results,
        users: usersRes.data.results,
        hospitals: hospitalsRes.data.results,
        approvedAppointments: appointmentsRes.data.results,
      });
      setNotifications(notificationsRes.data.results);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      axios.get("/admin/notifications").then((res) => setNotifications(res.data.results)).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar 
      sidebarOpen={sidebarOpen} 
      sidebarLinks={sidebarLinks} 
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
      />
      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={notifications} handleLogout={handleLogout} />
        <Box sx={{ flex: 1, p: 4 }}>
          <Typography variant="h4" gutterBottom color="text.primary" textAlign="center">Dashboard</Typography>
          <DashboardCards counts={counts} loading={loading} />
          <QuickAccess />
        </Box>
        <Footer />
        </Box>
    </Box>
  );
};

export default AdminDashboard;