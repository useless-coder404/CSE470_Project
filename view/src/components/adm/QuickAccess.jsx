import React from "react";
import { Box, Grid, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const QuickAccess = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 4, mt: 10, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom color="text.primary">Quick Access</Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, py: 2, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
            onClick={() => navigate("/admin/doctors")}
          >
            See All Pending Doctors
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, py: 2, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
            onClick={() => navigate("/admin/users?filter=blocked")}
          >
            See All Blocked Users
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, py: 2, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
            onClick={() => navigate("/admin/users?filter=deleted")}
          >
            See All Deleted Users
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuickAccess;
