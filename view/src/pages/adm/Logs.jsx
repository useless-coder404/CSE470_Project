import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Tabs, Grid, Tab } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from '@mui/icons-material'
import { motion } from "framer-motion";
import { getAuditLogs, getAILogs, getAIChatLogs } from "../../services/admin/adminLogService";
import LogCard from "../../components/adm/LogCard";
import Sidebar from "../../components/adm/Sidebar";
import Header from "../../components/adm/Header";
import Footer from "../../components/home/Footer";

export default function Logs() {
  const [tab, setTab] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarLinks = [
    { title: "Dashboard", link: "/admin" },
    { title: "Doctor Management", link: "/admin/doctors" },
    { title: "User Management", link: "/admin/users" },
    { title: "Hospitals", link: "/admin/hospitals" },
    { title: "Logs", link: "/admin/logs" },
    { title: "Notifications", link: "/admin/notifications" },
    { title: "System Settings", link: "/admin/system-settings" },    
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let response;
      if (tab === 0) response = await getAuditLogs();
      if (tab === 1) response = await getAILogs();
      if (tab === 2) response = await getAIChatLogs();

      setLogs(response.data || []);
    } catch (err) {
      console.error("Error fetching logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [Tab]);

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
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
        />

        <Box sx={{ flex: 1, p: 3 }}>
          {/* Page Title */}
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
              Logs Management
            </Typography>
          </motion.div>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, newVal) => setTab(newVal)}
            sx={{ mb: 3 }}
            centered
          >
            <Tab label="Audit Logs" />
            <Tab label="AI Logs" />
            <Tab label="AI Chat Logs" />
          </Tabs>

          {/* Logs List */}
          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
            >
              No logs found
            </Typography>
          ) : (
            <Grid container spacing={3} direction="column">
              {logs.map((log) => (
                <Grid item key={log._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <LogCard log={log} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}