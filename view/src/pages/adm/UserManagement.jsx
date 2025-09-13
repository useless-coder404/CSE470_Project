import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Grid, } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from '@mui/icons-material'
import { motion } from "framer-motion";
import { getAllUsers, blockUser, unblockUser, deleteUser, } from "../../services/admin/adminUserService";
import UserCard from "../../components/adm/UserCard";
import Sidebar from "../../components/adm/Sidebar";
import Header from "../../components/adm/Header";
import Footer from "../../components/home/Footer";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "block") await blockUser(id);
      if (action === "unblock") await unblockUser(id);
      if (action === "delete") await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("User action error", err);
    }
  };

  useEffect(() => {
    fetchUsers();
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
          notifications={[]}
        />

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
              User Management
            </Typography>
          </motion.div>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
            >
              No users found
            </Typography>
          ) : (
            <Grid container spacing={3} direction="column">
              {users.map((user) => (
                <Grid item key={user._id}>
                  <UserCard user={user} onAction={handleAction} />
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
