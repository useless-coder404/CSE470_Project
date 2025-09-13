import React from "react";
import { Button } from "@mui/material";

const QuickActionButton = ({ label, onClick, color = "primary" }) => {
  return (
    <Button 
      variant="contained" 
      color={color} 
      onClick={onClick} 
      sx={{ minWidth: 140, height: 40, borderRadius: 2, textTransform: "none" }}
    >
      {label}
    </Button>
  );
};

export default QuickActionButton;
