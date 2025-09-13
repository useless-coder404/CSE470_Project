import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const InputField = ({ label, type = 'text', icon, ...props }) => {
  return (
    <TextField
      label={label}
      type={type}
      fullWidth
      margin="normal"
      variant="outlined"
      InputProps={{
        startAdornment: icon && <InputAdornment position="start">{icon}</InputAdornment>,
      }}
      {...props}
    />
  );
};

export default InputField;
