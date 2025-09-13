import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Button, Snackbar, Alert } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from "@mui/icons-material"
import { motion } from "framer-motion";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import ReminderCard from "../../components/user/ReminderCard";
import ReminderForm from "../../components/user/ReminderForm";
import { getReminders, createReminder, updateReminder } from "../../services/user/Reminder";

export default function ReminderPage() {
  const [reminders, setReminders] = useState([]);
  const [editingReminder, setEditingReminder] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const sidebarLinks = [
    { title: "Profile", link: "/user/profile" },
    { title: "Health Log", link: "/user/healthlogs" },
    { title: "Reminder", link: "/user/reminders" },
    { title: "Appointment", link: "/user/appointments" },
    { title: "Emergency", link: "/user/emergency" },
    { title: "AI Diagnostics", link: "/user/ai" },
    { title: "Prescription Reader", link: "/user/prescriptions" },
  ];

  useEffect(() => {
    fetchAllReminders();
    const interval = setInterval(() => {
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to fetch reminders", severity: "error" });
    }
  };

  const handleSaveReminder = async (data) => {
    try {
      let saved;
      if (editingReminder) {
        saved = await updateReminder(editingReminder._id, data);
        setReminders(reminders.map(r => r._id === saved._id ? saved : r));
        setSnackbar({ open: true, message: "Reminder updated!", severity: "success" });
      } else {
        saved = await createReminder(data);
        setReminders([...reminders, saved]);
        setSnackbar({ open: true, message: "Reminder created!", severity: "success" });
      }
      setEditingReminder(null);
      setShowForm(false);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to save reminder", severity: "error" });
    }
  };

  const handleEdit = (reminder) => { setEditingReminder(reminder); setShowForm(true); };
  const handleDeleted = (id) => { setReminders(reminders.filter(r => r._id !== id)); };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarTitle={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
           <HealthAndSafetyIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}>
              Health Assistant
            </Typography>
          </Box>
        }
        sidebarLinks={sidebarLinks}
      />

      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={notifications} />

        <Box sx={{ flex: 1, p: 3 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 3, textAlign: "center", letterSpacing: 1 }}>
              My Reminders
            </Typography>
          </motion.div>

          {showForm && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 4 }}>
              <ReminderForm reminder={editingReminder} onSaved={handleSaveReminder} />
            </Paper>
          )}

          <Button
            variant="contained"
            sx={{ mb: 3, textTransform: "none", borderRadius: 2 }}
            onClick={() => { setEditingReminder(null); setShowForm(true); }}
          >
            Add New Reminder
          </Button>

          <Grid container spacing={3} direction="column">
            {reminders.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: "center", color: "text.secondary" }}>No reminders set yet.</Typography>
            ) : (
              reminders.map(reminder => (
                <motion.div
                  key={reminder._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ReminderCard reminder={reminder} onEdit={handleEdit} onDeleted={handleDeleted} />
                </motion.div>
              ))
            )}
          </Grid>
        </Box>

        <Footer />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
