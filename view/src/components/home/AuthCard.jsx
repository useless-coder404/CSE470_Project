import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const AuthCard = ({ title, children }) => {
  return (
    <Card sx={{ width: 400, p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

export default AuthCard;
