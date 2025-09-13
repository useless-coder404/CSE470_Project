import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AlarmIcon from '@mui/icons-material/Alarm';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useNavigate } from 'react-router-dom';

const cardsData = [
  {
    title: 'Upcoming Appointments',
    subtitle: 'Next doctor visit',
    icon: <EventIcon color="primary" fontSize="large" />,
    path: '/appointments',
  },
  {
    title: 'Health Logs',
    subtitle: 'Last recorded vitals',
    icon: <FavoriteIcon color="primary" fontSize="large" />,
    path: '/user/healthlogs',
  },
  {
    title: 'Reminders',
    subtitle: 'Next medicine reminder',
    icon: <AlarmIcon color="primary" fontSize="large" />,
    path: '/user/reminders',
  },
  {
    title: 'AI Diagnostics',
    subtitle: 'Latest AI suggestion',
    icon: <PsychologyIcon color="primary" fontSize="large" />,
    path: '/ai-chat',
  },
];

const OverviewCards = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1, mt: 4, px: 2 }}>
      <Grid container spacing={3}>
        {cardsData.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              onClick={() => navigate(card.path)}
              sx={{
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box mb={2}>{card.icon}</Box>
                <Typography variant="h6">{card.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverviewCards;
