import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';

const OTPModal = ({ open, onClose, onVerify }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = () => {
    onVerify(otp);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>Enter 2FA OTP</Typography>
        <TextField
          label="OTP"
          fullWidth
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
          Verify
        </Button>
      </Box>
    </Modal>
  );
};

export default OTPModal;
