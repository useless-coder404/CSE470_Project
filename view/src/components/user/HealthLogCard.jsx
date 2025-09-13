import React from "react";
import { Card, CardContent, Typography, IconButton, Stack, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const HealthLogCard = ({ log, onEdit, onDelete }) => {
  const displayValue = (value) => (value !== null && value !== undefined && value !== "" ? value : "-");

  return (
    <Card sx={{ mb: 2, backgroundColor: "#f9f9f9" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" color="textSecondary">
            {new Date(log.date).toLocaleDateString()}
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => onEdit(log)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(log._id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Typography variant="h6" mt={1}>Mood: {displayValue(log.mood)}</Typography>

        <Typography variant="body2" mt={0.5}>
          Height: {displayValue(log.height)} cm | Weight: {displayValue(log.weight)} kg
        </Typography>

        <Typography variant="body2" mt={0.5}>
          Vitals: Temp {displayValue(log.vitals?.temperature ?? "-")}°F, HR {displayValue(log.vitals?.heartRate ?? "-")}, BP {displayValue(log.vitals?.bloodPressure)}
        </Typography>

        <Stack direction="row" spacing={1} mt={1}>
          {log.symptoms?.map((s, index) => (
            <Chip key={index} label={s} size="small" />
          ))}
        </Stack>

        {log.notes && <Typography variant="body2" mt={1}>Notes: {displayValue(log.notes)}</Typography>}
      </CardContent>
    </Card>
  );
};

export default HealthLogCard;
