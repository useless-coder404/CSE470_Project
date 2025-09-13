import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { HealthAndSafety as HealthAndSafetyIcon } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer"
import OverviewCards from '../../components/user/OverviewCards';
import QuickActions from '../../components/user/QuickActions';
import EmergencySection from '../../components/user/EmergencySection';

const UserDashboard = () => {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const sidebarLinks = [
        { title: "Profile", link: "/user/profile" },
        { title: "Health Log", link: "/user/healthlogs" },
        { title: "Reminder", link: "/user/reminders" },
        { title: "Appointment", link: "/user/appointments" },      
        { title: "Emergency", link: "/user/emergency" },      
        { title: "AI Diagnostics", link: "/user/ai" }, 
        { title: "Prescription Reader", link: "/user/prescriptions" }, 
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            API.get("/auth/notifications")
                .then((res) => setNotifications(res.data.results)) 
                .catch(console.error);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default"}}>
            <Sidebar
                sidebarOpen={sidebarOpen}
                sidebarTitle={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2}}>
                        <HealthAndSafetyIcon sx={{ color: "#1976d2", fontSize: 28 }} />
                        <Typography variant="h6"
                            sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}>
                        Health Assistant
                        </Typography>
                    </Box>    
                }
                sidebarLinks={sidebarLinks}
            />
            <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={notifications} handleLogout={handleLogout} />
                <Box sx={{ flex: 1, p: 3}}>
                <OverviewCards />
                <Box sx={{ mt: 4}}>
                    <QuickActions />
                </Box> 
                <Box sx={{ mt: 6}}>
                    <EmergencySection />
                </Box>
                </Box>
                <Footer/>             
            </Box>
        </Box>
    );
};

export default UserDashboard;
