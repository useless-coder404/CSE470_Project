import React, { useState } from "react";
import { Box, Typography, Paper, TextField, Button, Grid, IconButton, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, HealthAndSafety as HealthAndSafetyIcon } from "@mui/icons-material";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import api from "../../api/api";

export default function EmergencyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([{ name: "", phone: "", email: "", relation: "" }]);
  const [location, setLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  const sidebarLinks = [
    { title: "Profile", link: "/user/profile" },
    { title: "Health Log", link: "/user/healthlogs" },
    { title: "Reminder", link: "/user/reminders" },
    { title: "Appointment", link: "/user/appointments" },
    { title: "Emergency", link: "/user/emergency" },
    { title: "AI Diagnostics", link: "/user/ai" },
    { title: "Prescription Reader", link: "/user/prescriptions" },
  ];

  const addContact = () => {
    if (contacts.length < 5) setContacts([...contacts, { name: "", phone: "", email: "", relation: "" }]);
  };

  const removeContact = (index) => {
    const newContacts = contacts.filter((_, idx) => idx !== index);
    setContacts(newContacts);
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setSnackbar({ open: true, message: "Geolocation not supported by your browser", severity: "error" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setSnackbar({ open: true, message: "Failed to get location", severity: "error" })
    );
  };

  const triggerEmergency = async () => {
    if (!message) {
      setSnackbar({ open: true, message: "Please enter an emergency message", severity: "error" });
      return;
    }
    if (!location) {
      setSnackbar({ open: true, message: "Please allow location access", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/emergency", { message, contacts, location });
      setSnackbar({ open: true, message: res.data.message || "Emergency alert sent", severity: "success" });
      setMessage("");
      setContacts([{ name: "", phone: "", email: "", relation: "" }]);
      setLocation(null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to trigger emergency", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
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
      sidebarLinks={sidebarLinks} />
      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={[]} />
        <Box sx={{ flex: 1, p: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }} elevation={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <HealthAndSafetyIcon sx={{ color: "primary.main", fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Emergency Alert</Typography>
            </Box>

            <TextField
              label="Emergency Message"
              fullWidth
              multiline
              minRows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>Emergency Contacts (Max 5)</Typography>
            {contacts.map((c, idx) => (
              <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={3}>
                  <TextField label="Name" value={c.name} fullWidth onChange={(e) => handleContactChange(idx, "name", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Phone" value={c.phone} fullWidth onChange={(e) => handleContactChange(idx, "phone", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Email" value={c.email} fullWidth onChange={(e) => handleContactChange(idx, "email", e.target.value)} />
                </Grid>
                <Grid item xs={10} sm={2}>
                  <TextField label="Relation" value={c.relation} fullWidth onChange={(e) => handleContactChange(idx, "relation", e.target.value)} />
                </Grid>
                <Grid item xs={2} sm={1}>
                  <IconButton color="error" onClick={() => removeContact(idx)} disabled={contacts.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addContact} disabled={contacts.length >= 5} sx={{ mb: 3 }}>
              Add Contact
            </Button>

            <Box sx={{ mb: 3 }}>
              <Button variant="contained" color="primary" onClick={fetchLocation} sx={{ mr: 2 }}>
                {location ? "Location Captured" : "Capture My Location"}
              </Button>
              {location && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Lat: {location.lat}, Lng: {location.lng}
                </Typography>
              )}
            </Box>

            <Button variant="contained" color="error" fullWidth onClick={triggerEmergency} disabled={loading}>
              {loading ? "Sending Emergency..." : "Trigger Emergency"}
            </Button>
          </Paper>
        </Box>
        <Footer />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
