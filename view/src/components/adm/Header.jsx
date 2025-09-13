import React, { useState } from "react";
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Badge, Box } from "@mui/material";
import { Menu as MenuIcon, Settings as SettingsIcon, Notifications as NotificationsIcon, AccountCircle as AccountCircleIcon, Logout as LogoutIcon, Dashboard as DashboardIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";

const Header = ({ sidebarOpen, setSidebarOpen, notifications = [] }) => { // <-- default []
  const navigate = useNavigate();
  const [anchorSettings, setAnchorSettings] = useState(null);
  const [anchorProfile, setAnchorProfile] = useState(null);
  const [anchorNotifications, setAnchorNotifications] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "primary.main", boxShadow: 3 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MenuIcon />
          </IconButton>
          <SearchBar />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Settings */}
          <IconButton color="inherit" onClick={(e) => setAnchorSettings(e.currentTarget)}>
            <SettingsIcon />
          </IconButton>
          <Menu
            anchorEl={anchorSettings}
            open={Boolean(anchorSettings)}
            onClose={() => setAnchorSettings(null)}
          >
            <MenuItem onClick={() => navigate("/admin/system-settings")}>Get System Settings</MenuItem>
            <MenuItem onClick={() => navigate("/admin/system-settings")}>Update System Settings</MenuItem>
          </Menu>

          {/* Notifications */}
          <IconButton color="inherit" onClick={(e) => setAnchorNotifications(e.currentTarget)}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorNotifications}
            open={Boolean(anchorNotifications)}
            onClose={() => setAnchorNotifications(null)}
          >
            {notifications.length === 0 && <MenuItem>No new notifications</MenuItem>}
            {notifications.map((n, idx) => (
              <MenuItem key={idx}>{n.message}</MenuItem>
            ))}
          </Menu>

          {/* Profile */}
          <IconButton color="inherit" onClick={(e) => setAnchorProfile(e.currentTarget)}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorProfile}
            open={Boolean(anchorProfile)}
            onClose={() => setAnchorProfile(null)}
          >
            <MenuItem
              onClick={() => {
                navigate("/admin/dashboard");
                setAnchorProfile(null);
              }}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
            >
              <DashboardIcon sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>

            <MenuItem onClick={handleLogout} component={motion.div} whileHover={{ scale: 1.05 }}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
