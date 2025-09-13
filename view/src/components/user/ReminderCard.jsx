import React, { useState } from "react";
import { Box, Paper, Typography, IconButton, Checkbox, Tooltip, Snackbar, Alert } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { deleteReminder, updateReminder } from "../../services/user/Reminder";
import { motion } from "framer-motion";

export default function ReminderCard({ reminder, onEdit, onDeleted }) {
  const [completed, setCompleted] = useState(reminder.completed);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleToggleCompleted = async () => {
    try {
      const updated = await updateReminder(reminder._id, { completed: !completed });
      setCompleted(updated.completed);
      setSnackbar({ open: true, message: "Reminder updated!", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to update reminder", severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;

    try {
      await deleteReminder(reminder._id);
      onDeleted(reminder._id);
      setSnackbar({ open: true, message: "Reminder deleted!", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete reminder", severity: "error" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: completed ? "grey.100" : "background.paper",
          boxShadow: 4,
          "&:hover": { boxShadow: 8, transform: "translateY(-2px)", transition: "0.3s" },
        }}
      >
        {/* Left Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Checkbox checked={completed} onChange={handleToggleCompleted} />
          <Box>
            <Typography variant="subtitle1" sx={{ textDecoration: completed ? "line-through" : "none", fontWeight: 600 }}>
              {reminder.medicineName} - {reminder.dosage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(reminder.time).toLocaleString()} | Repeat: {reminder.repeat}
            </Typography>
            {reminder.notes && (
              <Typography variant="body2" color="text.secondary">
                Notes: {reminder.notes}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right Actions */}
        <Box>
          <Tooltip title="Edit Reminder">
            <IconButton onClick={() => onEdit(reminder)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Reminder">
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </motion.div>
  );
}
