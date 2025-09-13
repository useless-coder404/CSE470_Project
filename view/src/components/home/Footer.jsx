import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#1976d2",
        color: "#fff",
        py: 1,
        textAlign: "center",
        transition: "all 0.3s ease",
        ml: 0,
        mt: "auto",
      }}
    >
      <Typography variant="h6">Health Assistant</Typography>
      <Typography sx={{ mt: 1 }}>
        © 2025 Health Assistant. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
