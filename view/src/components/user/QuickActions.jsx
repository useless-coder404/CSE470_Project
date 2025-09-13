import React from 'react';
import { Grid, Button, Paper, Typography } from '@mui/material';
import { CalendarToday, CloudUpload, Description } from '@mui/icons-material';

const QuickActions = () => {
  const actions = [
    { label: 'Book Appointment', icon: <CalendarToday />, color: 'primary' },
    { label: 'Upload Document', icon: <CloudUpload />, color: 'secondary' },
    { label: 'View Prescriptions', icon: <Description />, color: 'info' },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Button
              fullWidth
              variant="contained"
              color={action.color}
              startIcon={action.icon}
              sx={{
                py: 2,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions;
