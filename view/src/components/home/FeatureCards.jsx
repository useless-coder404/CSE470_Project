import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { FaStethoscope, FaClipboardList, FaRobot, FaRegCalendarPlus } from "react-icons/fa";

const features = [
  { icon: <FaStethoscope size={40} />, title: "Doctor Recommendation", desc: "Find verified doctors nearby" },
  { icon: <FaClipboardList size={40} />, title: "Health Assistant", desc: "Track medicines & appointments" },
  { icon: <FaRobot size={40} />, title: "AI Diagnosis", desc: "Smart symptom checker" },
  { icon: <FaRegCalendarPlus size={40} />, title: "Book Appointments", desc: "Easily book appointments online" },
];

const FeatureCards = () => {
  return (
    <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
      {features.map((feature, index) => (
        <Grid item xs={12} md={3} key={index}>
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card sx={{ textAlign: "center", p: 2, borderRadius: 3, boxShadow: 4 }}>
              <CardContent>
                <div style={{ marginBottom: "10px" }}>{feature.icon}</div>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default FeatureCards;
