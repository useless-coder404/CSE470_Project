import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const OverviewCard = ({ title, value }) => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
