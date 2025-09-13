import React from "react";
import FeatureCards from "../../components/home/FeatureCards";
import { Box, Typography } from "@mui/material";

const FeaturesPage = () => {
  return (
    <Box sx={{ py: 8, px: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Features
      </Typography>
      <FeatureCards />
    </Box>
  );
};

export default FeaturesPage;