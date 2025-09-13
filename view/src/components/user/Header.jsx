import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Badge, Menu, MenuItem, Box } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, AccountCircle as AccountCircleIcon, Person as PersonIcon, Dashboard as DashboardIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = ({ sidebarOpen, setSidebarOpen, notifications}) => {
    const navigate = useNavigate();
    const [anchorProfile, setAnchorProfile] = useState(null);
    const [anchorNotifications, setAnchorNotifications] = useState(null);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <AppBar position="static" sx={{ bgcolor: "primary.main", boxShadow: 3 }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <MenuIcon />
                    </IconButton>
                </Box>
                <Box>
                    {/* Notifications */}
                    <IconButton color="inherit" onClick={(e) => setAnchorNotifications(e.currentTarget)}>
                        <Badge badgeContent={notifications?.length || 0} color="error">  {/* fixed .length */}
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <Menu
                        anchorEl={anchorNotifications}
                        open={Boolean(anchorNotifications)}
                        onClose={() => setAnchorNotifications(null)}
                    >
                        {notifications?.length === 0 && <MenuItem>No new notifications</MenuItem>}
                        {notifications?.map((n, idx) => (
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
                                navigate("/user/profile");
                                setAnchorProfile(null);
                            }}
                            component={motion.div}
                            whileHover={{ scale: 1.05 }}
                        >
                            <PersonIcon sx={{ mr: 1 }} />
                            Profile
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                navigate("/user/dashboard");
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
