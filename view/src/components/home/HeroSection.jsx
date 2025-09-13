import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import heroImage from "../../assets/hero.svg";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const HeroSection = () => {
  return (
    <Box sx={{ py: 8, px: 4, backgroundColor: "#f5f5f5" }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Typography variant="h3" gutterBottom>
              Your Personal Health Assistant
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/register"
                sx={{ mr: 2 }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/login"
              >
                Login
              </Button>
            </Box>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.img
            src={heroImage}
            alt="Health AI Illustration"
            style={{ width: "100%", borderRadius: 12 }}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSection;
