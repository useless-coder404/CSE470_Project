import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, InputBase, IconButton, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search-doctor?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 2rem",
        height: "70px",
        backgroundColor: "#1976d2",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <HealthAndSafetyIcon sx={{ color: "#fff", fontSize: 28 }} />
        <Link
          to="/"
          style={{
            variant: "h6", 
            textDecoration: "none",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          Health Assistant
        </Link>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Button
          component={Link}
          to="/"
          variant="text"
          sx={{ color: "#fff" }}
        >
          Home
        </Button>
        <Button
          component={Link}
          to="/features"
          variant="text"
          sx={{ color: "#fff" }}
        >
          Features
        </Button>
        <Button
          component={Link}
          to="/login"
          variant="text"
          sx={{ color: "#fff" }}
        >
          Login
        </Button>
        <Button
          component={Link}
          to="/register"
          variant="text"
          sx={{ color: "#fff" }}
        >
          Sign Up
        </Button>

        {/* Search Box */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "0 0.5rem",
            borderRadius: "999px",
          }}
        >
          <InputBase
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton type="submit" sx={{ p: "10px" }}>
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default Header;