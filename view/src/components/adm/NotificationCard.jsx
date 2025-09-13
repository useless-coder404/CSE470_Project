import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, Stack } from "@mui/material";

const NotificationCard = ({ onSend }) => {
  const [form, setForm] = useState({
    userId: "",
    title: "",
    message: "",
    type: "info",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSend = async () => {
    if (!form.userId || !form.title || !form.message) return;
    setLoading(true);
    try {
      await onSend(form);
      setForm({ userId: "", title: "", message: "", type: "info" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent>
        <Typography variant="h6" mb={2} color="primary.main">
          Send Notification
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="User ID"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
