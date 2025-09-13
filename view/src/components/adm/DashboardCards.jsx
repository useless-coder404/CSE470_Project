import React from "react";
import { Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArticleIcon from "@mui/icons-material/Article";

const DashboardCards = ({ counts, loading }) => {
  const cards = [
    { title: "Pending Doctors", count: counts.pendingDoctors, icon: <PersonAddIcon fontSize="large" color="primary" /> },
    { title: "Doctors", count: counts.allDoctors, icon: <MedicalServicesIcon fontSize="large" color="primary" /> },
    { title: "Users", count: counts.users, icon: <PeopleIcon fontSize="large" color="primary" /> },
    { title: "Hospitals", count: counts.hospitals, icon: <LocalHospitalIcon fontSize="large" color="primary" /> },
    { title: "Approved Appointments", count: counts.approvedAppointments, icon: <ArticleIcon fontSize="large" color="primary" /> },
  ];

  return (
    <Grid container spacing={3} justifyContent="center">
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 3,
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "translateY(-5px)" },
              }}
            >
              {card.icon}
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6">{card.title}</Typography>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="subtitle1" color="text.secondary">{card.count}</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCards;
