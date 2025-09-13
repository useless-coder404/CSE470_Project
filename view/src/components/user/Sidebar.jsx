import React from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, sidebarLinks, sidebarTitle }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: sidebarOpen ? 0 : -240,
        width: 240,
        height: "100vh",
        bgcolor: "background.paper",
        boxShadow: 3,
        p: 2,
        transition: "all 0.3s",
        zIndex: 10,
      }}
    >
      {sidebarTitle}
      {sidebarLinks.map((item) => (
        <Button
          key={item.title}
          fullWidth
          sx={{
            mb: 1,
            justifyContent: "flex-start",
            textTransform: "none",
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.light", color: "#fff" },
          }}
          onClick={() => navigate(item.link)}
        >
          {item.title}
        </Button>
      ))}
    </Box>
  );
};

export default Sidebar;
