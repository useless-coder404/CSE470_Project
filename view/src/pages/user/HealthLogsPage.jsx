import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Snackbar, Alert, Grid, Paper, } from "@mui/material";
import { motion } from "framer-motion";
import { HealthAndSafety as HealthAndSafetyIcon, } from "@mui/icons-material";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import HealthLogCard from "../../components/user/HealthLogCard";
import HealthLogForm from "../../components/user/HealthLogForm";
import { getHealthLogs, createHealthLog, updateHealthLog, deleteHealthLog, } from "../../services/user/HealthLog";
import api from "../../api/api";

export default function HealthLogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      api
        .get("/auth/notifications")
        .then((res) => setNotifications(res.data.results))
        .catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
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

  const fetchLogs = async () => {
    try {
      const data = await getHealthLogs();
      setLogs(data);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to fetch logs",
        severity: "error",
      });
    }
  };

  const handleAdd = () => {
    setSelectedLog(null);
    setOpenForm(true);
  };

  const handleEdit = (log) => {
    setSelectedLog(log);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this health log?"))
      return;

    try {
      await deleteHealthLog(id);
      setLogs((prev) => prev.filter((log) => log._id !== id));
      setSnackbar({
        open: true,
        message: "Health log deleted",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to delete health log",
        severity: "error",
      });
    }
  };

  const handleSubmit = async (formData) => {
    try {
      let updatedLogs;

      if (selectedLog) {
        const updatedLog = await updateHealthLog(selectedLog._id, formData);
        updatedLogs = logs.map((log) =>
          log._id === updatedLog._id ? updatedLog : log
        );
        setSnackbar({
          open: true,
          message: "Health log updated",
          severity: "success",
        });
      } else {
        const newLog = await createHealthLog(formData);
        updatedLogs = [newLog, ...logs];
        setSnackbar({
          open: true,
          message: "Health log added",
          severity: "success",
        });
      }

      setLogs(updatedLogs);
      setOpenForm(false);
      setSelectedLog(null);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Operation failed",
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <HealthAndSafetyIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.2rem",
                color: "#1976d2",
              }}
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
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
        />

        {/* Main Content */}
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
                letterSpacing: 1,
              }}
            >
              My Health Logs
            </Typography>
          </motion.div>

          <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={handleAdd}
            >
              Add Health Log
            </Button>

            {/* Health Logs List */}
            <Grid container spacing={2}>
              {logs.length === 0 ? (
                <Typography>No health logs found...</Typography>
              ) : (
                logs.map((log) => (
                  <Grid item xs={12} md={6} key={log._id}>
                    <HealthLogCard
                      log={log}
                      onEdit={() => handleEdit(log)}
                      onDelete={() => handleDelete(log._id)}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          </Paper>
        </Box>

        <Footer />
      </Box>

      {/* Form Modal */}
      <HealthLogForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        log={selectedLog}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
