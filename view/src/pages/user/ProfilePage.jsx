import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Tabs, Tab, LinearProgress, Grid, Paper, TextField, Button, Divider, Snackbar, Alert, } from "@mui/material";
import { Person as PersonIcon, CalendarMonth as CalendarIcon, LocationOn as LocationIcon, Bloodtype as BloodIcon, Wc as GenderIcon, 
  HealthAndSafety as HealthAndSafetyIcon, CameraAlt as CameraAltIcon, } from "@mui/icons-material";
import { motion } from "framer-motion";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import api from "../../api/api";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [tab, setTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(() => {
      api.get("/user/notifications")
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

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data.user);
      setFormData({
        name: res.data.user.name || "",
        username: res.data.user.username || "",
        age: res.data.user.age || "",
        gender: res.data.user.gender || "",
        contact: res.data.user.contact || "",
        birthday: res.data.user.birthday || "",
        address: res.data.user.address || "",
        bloodGroup: res.data.user.bloodGroup || "",
        intro: res.data.user.intro || "",
      });
      setProfilePic(res.data.user.profilePic || null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to load profile", severity: "error" });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) setProfilePic(e.target.files[0]);
  };

  const handleUploadProfilePic = async () => {
    if (!profilePic) return;
    const form = new FormData();
    form.append("profilePic", profilePic);
    try {
      const res = await api.post("/auth/upload-profile-pic", form, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile(res.data.user);
      setSnackbar({ open: true, message: "Profile picture updated", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to upload picture", severity: "error" });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.patch("/auth/update-profile", formData);
      setProfile(res.data.user);
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
    await api.patch("/auth/change-password", {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
    setSnackbar({ open: true, message: "Password updated successfully", severity: "success" });
    setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
  } catch (err) {
    console.error(err);
    setSnackbar({ open: true, message: err.response?.data?.message || "Failed to update password", severity: "error" });
  }
  };

  const handleToggle2FA = async () => {
  try {
    const res = await api.patch("/auth/toggle-2fa");
    setProfile({ ...profile, isTwoFAEnabled: !profile.isTwoFAEnabled });
    setSnackbar({ open: true, message: res.data.message, severity: "success" });
  } catch (err) {
    console.error(err);
    setSnackbar({ open: true, message: err.response?.data?.message || "Failed to toggle 2FA", severity: "error" });
  }
  };

  const handleDeleteAccount = async () => {
  if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

  try {
    await api.delete("/auth/delete");
    setSnackbar({ open: true, message: "Account deleted successfully", severity: "success" });
    window.location.href = "/";
  } catch (err) {
    console.error(err);
    setSnackbar({ open: true, message: err.response?.data?.message || "Failed to delete account", severity: "error" });
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
               My Profile 
            </Typography>
          </motion.div>

          <Grid container spacing={3} direction="column">
            {/* Profile Overview */}
            <Grid item>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }} elevation={4}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar src={profile?.profilePic || ""} sx={{ width: 120, height: 120, 
                    boxShadow: 3, transition: "transform 0.3s", "&:hover": { transform: "scale(1.05)" }, }}>
                    {!profile?.profilePic && <PersonIcon sx={{ fontSize: 90 }} />}
                  </Avatar>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      minWidth: 36,
                      height: 36,
                      borderRadius: "50%",
                      p: 0,
                      bgcolor: "primary.main",
                      opacity: 0.9,
                      transition: "all 0.3s",
                      "&:hover": { bgcolor: "primary.dark", transform: "scale(1.2)" },
                    }}
                  >
                    <CameraAltIcon fontSize="small" />
                    <input type="file" hidden accept="image/*" onChange={handleProfilePicChange} />
                  </Button>
                </Box>
                <Button variant="contained" color="primary" size="medium" sx={{ mt: 1, minWidth: 140, height: 40, 
                  borderRadius: 10, textTransform: "none", boxShadow: 2, }} onClick={handleUploadProfilePic} disabled={!profilePic}>
                  Upload Picture
                </Button>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>{profile?.name || "Guest User"}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.age ? `${profile.age} years old` : "Age not set"}</Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600}>Profile Completion: {profile?.completion || 70}%</Typography>
                  <LinearProgress variant="determinate" value={profile?.completion || 70} sx={{ borderRadius: 2, height: 8, mt: 1 }} />
                </Box>

                <Box sx={{ mt: 3, textAlign: "left" }}>
                  <InfoRow icon={<GenderIcon />} text={profile?.gender || "Not specified"} />
                  <InfoRow icon={<CalendarIcon />} text={profile?.birthday || "Not set"} />
                  <InfoRow icon={<LocationIcon />} text={profile?.address || "No address"} />
                  <InfoRow icon={<BloodIcon />} text={profile?.bloodGroup || "Unknown"} />
                </Box>
              </Paper>
            </Grid>

            {/*Profile Tabs */}
            <Grid item>
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 2 }}>
                  <Tab value="profile" label="Profile" />
                  <Tab value="settings" label="Profile Settings" />
                </Tabs>

                {tab === "profile" && (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>Introduction:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile?.intro || "Hello! I'm using Health Assistant to manage my health."}
                    </Typography>
                  </Box>
                )}

                {tab === "settings" && (
                  <Box>
                    <Button variant="contained" color={editMode ? "secondary" : "primary"} onClick={() => setEditMode(!editMode)} sx={{ mb: 2 }}>
                      {editMode ? "Cancel" : "Edit"}
                    </Button>

                    {editMode && (
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        {["name", "username", "age", "gender", "contact", "birthday", "address", "bloodGroup", "intro"].map((field) => (
                          <TextField
                            key={field}
                            fullWidth
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                          />
                        ))}
                        <Button variant="contained" color="primary" onClick={handleUpdateProfile} sx={{ gridColumn: "span 2" }}>
                          Save Changes
                        </Button>
                      </Box>
                    )}
                    {/* Change Password */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Change Password</Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <TextField type="password" label="Current Password" name="currentPassword" value={formData.currentPassword || ""} onChange={handleChange}/>
                        <TextField type="password" label="New Password" name="newPassword" value={formData.newPassword || ""} onChange={handleChange} />
                        <TextField type="password" label="Confirm New Password" name="confirmPassword" value={formData.confirmPassword || ""} onChange={handleChange}/>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ gridColumn: "span 2" }}
                          onClick={handleChangePassword}
                        >
                          Update Password
                        </Button>
                      </Box>
                    </Box>

                    {/* 2FA Toggle */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Two-Factor Authentication (2FA)</Typography>
                      <Button 
                        variant="contained" 
                        color={profile?.isTwoFAEnabled ? "secondary" : "primary"}
                        onClick={handleToggle2FA}
                      >
                        {profile?.isTwoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
                      </Button>
                    </Box>

                    {/* Delete Account */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1, color: "error.main" }}>Delete Account</Typography>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleDeleteAccount}
                      >
                        Delete My Account
                      </Button>
                    </Box>
                  </Box>
                )}

              </Paper>
            </Grid>

            {/* Health Summary */}
            <Grid item>
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
                  Health Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {["Average Weight","Average BP","Average HR","Average Temp","Current Weight","Current BP","Current HR","Current Temp"].map((label, idx) => (
                    <HealthStat key={idx} label={label} value={profile?.health?.[label] || "-"} />
                  ))}
                </Grid>
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

function HealthStat({ label, value }) {
  return (
    <Grid item xs={6} sm={3}>
      <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }} elevation={2}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
      </Paper>
    </Grid>
  );
}