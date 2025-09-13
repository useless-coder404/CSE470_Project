import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Grid, Paper, TextField, Button, LinearProgress, Tabs, Tab, Snackbar, Alert, } from "@mui/material";
import { Person as PersonIcon, CameraAlt as CameraAltIcon, HealthAndSafety as HealthIcon, 
  Work as WorkIcon, LocationOn as LocationIcon, } from "@mui/icons-material";
import { motion } from "framer-motion";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import { getDoctorProfile, updateDoctorProfile, changeDoctorPassword, toggleDoctor2FA, } from "../../services/doctor/doctorService";
import API from "../../api/api";

export default function DoctorProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tab, setTab] = useState("profile");
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const sidebarLinks = [
    { title: "Dashboard", link: "/doctor/dashboard"},
    { title: "Profile", link: "/doctor/profile" },
    { title: "Appointments", link: "/doctor/appointments" },
    { title: "Patients", link: "/doctor/patients" },
    { title: "Upload Documents", link: "/doctor/upload-docs" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getDoctorProfile();
      console.log("Doctor API response:", res);
      setProfile(res.doctor); 
      setFormData({
        name: res.doctor.name || "",
        specialty: res.doctor.specialty || "",
        bio: res.doctor.bio || "",
        phone: res.doctor.phone || "",
        experience: res.doctor.experience || "",
        fees: res.doctor.fees || "",
        clinicLocation: res.doctor.clinicLocation || { type: "Point", coordinates: [0, 0] },
        availability: res.doctor.availability || [],
      });
      setProfilePic(res.doctor.profilePic || null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to load profile", severity: "error" });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleProfilePicChange = (e) => { if (e.target.files[0]) setProfilePic(e.target.files[0]); };

  const handleUploadProfilePic = async () => {
    if (!profilePic) return;
    const form = new FormData();
    form.append("profilePic", profilePic);
    try {
      await updateDoctorProfile(form);
      fetchProfile();
      setSnackbar({ open: true, message: "Profile picture updated", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to upload picture", severity: "error" });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateDoctorProfile(formData);
      fetchProfile();
      setEditMode(false);
      setSnackbar({ open: true, message: "Profile updated successfully", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to update profile", severity: "error" });
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match", severity: "error" });
      return;
    }
    try {
      await changeDoctorPassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      setSnackbar({ open: true, message: "Password updated successfully", severity: "success" });
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to update password", severity: "error" });
    }
  };

  const handleToggle2FA = async () => {
    try {
      const res = await toggleDoctor2FA();
      setProfile({ ...profile, isTwoFAEnabled: !profile.isTwoFAEnabled });
      setSnackbar({ open: true, message: res.message, severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to toggle 2FA", severity: "error" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await API.delete("/doctor/delete-account");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete account", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarTitle={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <HealthIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}>
              Health Assistant
            </Typography>
          </Box>
        }
        sidebarLinks={sidebarLinks}
      />

      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={[]} />

        <Box sx={{ flex: 1, p: 3 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 3, textAlign: "center", letterSpacing: 1 }}>
              My Profile
            </Typography>
          </motion.div>

          <Grid container spacing={3} direction="column">
            {/* Profile Card */}
            <Grid item>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }} elevation={4}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <Avatar src={profile?.profilePic || ""} sx={{ width: 120, height: 120, boxShadow: 3, "&:hover": { transform: "scale(1.05)" } }}>
                      {!profile?.profilePic && <PersonIcon sx={{ fontSize: 90 }} />}
                    </Avatar>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        position: "absolute", bottom: 0, right: 0, minWidth: 36, height: 36, borderRadius: "50%",
                        p: 0, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark", transform: "scale(1.2)" },
                      }}
                    >
                      <CameraAltIcon fontSize="small" />
                      <input type="file" hidden accept="image/*" onChange={handleProfilePicChange} />
                    </Button>
                  </Box>
                  <Button variant="contained" color="primary" size="medium" sx={{ mt: 1, minWidth: 140, height: 40 }} onClick={handleUploadProfilePic} disabled={!profilePic}>
                    Upload Picture
                  </Button>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>{profile?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.specialty || "Specialty not set"}</Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600}>Profile Completion: {profile?.completion || 70}%</Typography>
                  <LinearProgress variant="determinate" value={profile?.completion || 70} sx={{ borderRadius: 2, height: 8, mt: 1 }} />
                </Box>

                <Box sx={{ mt: 3, textAlign: "left" }}>
                  <InfoRow icon={<WorkIcon />} text={`Experience: ${profile?.experience || "-" } years`} />
                  <InfoRow icon={<LocationIcon />} text={`Clinic: ${profile?.clinicLocation?.coordinates.join(", ") || "-"}`} />
                  <InfoRow icon={<PersonIcon />} text={`Phone: ${profile?.phone || "-"}`} />
                  <InfoRow icon={<PersonIcon />} text={`Fees: ${profile?.fees || "-"}`} />
                </Box>
              </Paper>
            </Grid>

            {/* Tabs */}
            <Grid item>
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 2 }}>
                  <Tab value="profile" label="Profile Info" />
                  <Tab value="settings" label="Settings" />
                </Tabs>

                {tab === "profile" && (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>Bio:</Typography>
                    <Typography variant="body2" color="text.secondary">{profile?.bio || "No bio set."}</Typography>
                  </Box>
                )}

                {tab === "settings" && (
                  <Box>
                    <Button variant="contained" color={editMode ? "secondary" : "primary"} onClick={() => setEditMode(!editMode)} sx={{ mb: 2 }}>
                      {editMode ? "Cancel" : "Edit Profile"}
                    </Button>

                    {editMode && (
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        {["name","specialty","bio","phone","experience","fees"].map((field) => (
                          <TextField key={field} fullWidth label={field.charAt(0).toUpperCase() + field.slice(1)} name={field} value={formData[field]} onChange={handleChange} />
                        ))}
                        <Button variant="contained" color="primary" onClick={handleUpdateProfile} sx={{ gridColumn: "span 2" }}>Save Changes</Button>
                      </Box>
                    )}

                    {/* Change Password */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Change Password</Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <TextField type="password" label="Current Password" name="currentPassword" value={formData.currentPassword || ""} onChange={handleChange}/>
                        <TextField type="password" label="New Password" name="newPassword" value={formData.newPassword || ""} onChange={handleChange}/>
                        <TextField type="password" label="Confirm New Password" name="confirmPassword" value={formData.confirmPassword || ""} onChange={handleChange}/>
                        <Button variant="contained" color="primary" sx={{ gridColumn: "span 2" }} onClick={handleChangePassword}>Update Password</Button>
                      </Box>
                    </Box>

                    {/* 2FA */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Two-Factor Authentication (2FA)</Typography>
                      <Button variant="contained" color={profile?.isTwoFAEnabled ? "secondary" : "primary"} onClick={handleToggle2FA}>
                        {profile?.isTwoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
                      </Button>
                    </Box>

                    {/* Delete Account */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1, color: "error.main" }}>Delete Account</Typography>
                      <Button variant="contained" color="error" onClick={handleDeleteAccount}>Delete My Account</Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
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

function InfoRow({ icon, text }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      {icon}
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
}
