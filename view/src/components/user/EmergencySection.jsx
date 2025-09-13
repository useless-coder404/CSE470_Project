import React, { useState } from 'react';
import { Paper, Typography, Button, Box, Snackbar, Alert, TextField } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import API from '../../api/api';

const EmergencySection = () => {
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const handleEmergency = async () => {
    if (!message.trim()) {
      setSnackbar({ open: true, message: 'Please enter an emergency message', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        const res = await API.post('/auth/emergency', {
          message,
          location: { lat: latitude, lng: longitude },
          contacts: [],
        });

        setSnackbar({ open: true, message: 'Emergency alert sent!', severity: 'success' });
        setMessage('');
      }, (err) => {
        console.error(err);
        setSnackbar({ open: true, message: 'Failed to get location', severity: 'error' });
      });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to trigger emergency', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          backgroundColor: '#fff5f5',
        }}
      >
        <Typography variant="h6" gutterBottom color="error">
          Emergency Assistance
        </Typography>

        <Box mt={2} mb={2}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Describe your emergency..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Box>

        <Box mt={2}>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<WarningAmberIcon />}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: '0 6px 16px rgba(229, 57, 53, 0.4)',
            }}
            onClick={handleEmergency}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Trigger Emergency'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default EmergencySection;
