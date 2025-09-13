import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import AuthCard from '../../components/home/AuthCard';
import InputField from '../../utils/InputField';
import { registerUser, verifyOTP } from '../../api/auth';
import { Button, CircularProgress, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState('');
  const [setUserId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // OTP timer & resend states
  const [timeLeft, setTimeLeft] = useState(350); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Countdown timer for OTP
  useEffect(() => {
    if (!otpStage) return;
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [otpStage, timeLeft]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password
      });

      setOtpStage(true); 
      setUserId(res.data.userId);
      showSnackbar(res.data.message);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const res = await verifyOTP({ email: form.email, otp, role: form.role });
      showSnackbar(res.data.message);

      setTimeout(() => {
        navigate(res.data.redirect || "/");
      }, 800);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown) return;

    try {
      setResendCooldown(true);
      setTimeLeft(300);
      setCanResend(false);

      const res = await registerUser({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password
      });

      showSnackbar('OTP resent. Check your email.');
      setUserId(res.data.userId);

      setTimeout(() => setResendCooldown(false), 5000);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to resend OTP', 'error');
      setResendCooldown(false);
    }
  };

  return (
    <AuthLayout bgImage="/assets/register-bg.svg">
      <AuthCard title="Register">
        {!otpStage ? (
          <>
            <InputField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={<PersonIcon />}
            />
            <InputField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              icon={<EmailIcon />}
            />
            <InputField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              icon={<PersonIcon />}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              icon={<LockIcon />}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={form.role} label="Role" onChange={handleChange}>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </>
        ) : (
          <>
            <InputField
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Typography sx={{ mt: 1 }}>
              OTP expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>

            {canResend && (
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={handleResendOTP}
                disabled={resendCooldown}
              >
                {resendCooldown ? 'Please wait...' : 'Resend OTP'}
              </Button>
            )}
          </>
        )}
      </AuthCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
};

export default Register;
