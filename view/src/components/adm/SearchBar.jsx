import React, { useState } from "react";
import { TextField, InputAdornment, Box, MenuItem, CircularProgress, Typography } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "../../api/api";

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const [usersRes, doctorsRes] = await Promise.all([
        axios.get(`/admin/users?search=${query}`),
        axios.get(`/admin/doctors?search=${query}`),
      ]);

      setSearchResults([
        ...usersRes.data.users.map((u) => ({ type: "User", name: u.name || u.email })),
        ...doctorsRes.data.doctors.map((d) => ({ type: "Doctor", name: d.name || d.email })),
      ]);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        size="small"
        placeholder="Search doctors or patients..."
        sx={{ bgcolor: "background.paper", borderRadius: 2, width: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {searchQuery && (
        <Box
          sx={{
            position: "absolute",
            top: 50,
            left: 0,
            width: 300,
            maxHeight: 300,
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 20,
          }}
        >
          {searchLoading ? (
            <Box sx={{ p: 2, textAlign: "center", color: "text.primary" }}>
              <CircularProgress size={20} />
            </Box>
          ) : searchResults.length > 0 ? (
            searchResults.map((item, idx) => (
              <MenuItem
                key={idx}
                onClick={() => {
                  if (item.type === "User") navigate(`/admin/users?exact=${encodeURIComponent(item.name)}`);
                  if (item.type === "Doctor") navigate(`/admin/doctors?exact=${encodeURIComponent(item.name)}&verified=true`);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                sx={{ color: "text.primary", "&:hover": { bgcolor: "primary.light", color: "#fff" } }}
                component={motion.div}
                whileHover={{ scale: 1.05 }}
              >
                <Typography variant="body2">
                  {item.type}: <b>{item.name}</b>
                </Typography>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: "center" }}>No results found</Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
