import React from 'react';
import { Box } from '@mui/material';

const AuthLayout = ({ children, bgImage }) => {
  return (
    <Box
      sx={{
        minHeight: '125vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 2,
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;
