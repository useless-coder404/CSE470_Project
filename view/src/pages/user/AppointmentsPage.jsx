import React, { useEffect, useState } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import AppointmentCard from "../../components/user/AppointmentCard";
import AppointmentForm from "../../components/user/AppointmentForm";
import { getAppointments, bookAppointment, rescheduleAppointment, cancelAppointment } from "../../services/user/appointment";

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to load appointments", severity: "error" });
    }
  };

  const handleBook = async (formData) => {
    try {
      await bookAppointment(formData);
      fetchAppointments();
      setSnackbar({ open: true, message: "Appointment booked successfully", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Booking failed", severity: "error" });
    }
  };

  const handleReschedule = async (appointment) => {
    const newDate = prompt("Enter new date (YYYY-MM-DD HH:mm):");
    if (!newDate) return;
    try {
      await rescheduleAppointment(appointment._id, newDate);
      fetchAppointments();
      setSnackbar({ open: true, message: "Appointment rescheduled", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Reschedule failed", severity: "error" });
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      fetchAppointments();
      setSnackbar({ open: true, message: "Appointment canceled", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Cancel failed", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarTitle={
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
            Health Assistant
          </Typography>
        }
        sidebarLinks={sidebarLinks}
      />

      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <Box sx={{ flex: 1, p: 3 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 3, textAlign: "center" }}>
              My Appointments
            </Typography>
          </motion.div>

          <AppointmentForm onSubmit={handleBook} />

          {/* Appointment List */}
          {appointments.length === 0 ? (
            <Typography color="text.secondary">No appointments found.</Typography>
          ) : (
            appointments.map((a) => (
              <AppointmentCard key={a._id} appointment={a} onReschedule={handleReschedule} onCancel={handleCancel} />
            ))
          )}
        </Box>

        <Footer />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
