import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import AuthCard from '../../components/home/AuthCard';
import InputField from '../../utils/InputField';
import OTPModal from '../../utils/OTPModal';
import { loginUser, verify2FA } from '../../api/auth';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const navigateDoctorRoute = (decoded) => {
  const docsUploaded = decoded.docsUploaded === "true" || decoded.docsUploaded === true;

  if (decoded.verificationStatus === "Pending" && !docsUploaded) {
    navigate("/doctor/upload-docs", { replace: true });
  } else if (decoded.verificationStatus === "Pending" && docsUploaded) {
    navigate("/doctor/upload-docs", { replace: true });
  } else if (decoded.verificationStatus === "Rejected" && docsUploaded) {
    navigate("/doctor/upload-docs", { replace: true });
  } else {
    navigate("/doctor/dashboard", { replace: true });
  }
  };


  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await loginUser(form);

      if (res.data.token && res.data.message?.includes('2FA OTP sent')) {
        setTwoFAToken(res.data.token);
        setOtpModalOpen(true);
      } else {
        localStorage.setItem('token', res.data.token);

        const decoded = jwtDecode(res.data.token);
        if (decoded) localStorage.setItem('user', JSON.stringify(decoded));

        showSnackbar('Login successful!');

        setTimeout(() => {
          if (decoded.role.toLowerCase() === "doctor") {
            navigateDoctorRoute(decoded);
          } else {
            navigate(`/${decoded.role.toLowerCase()}/dashboard`, { replace: true });
          }
        }, 500);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (otp) => {
    try {
      const res = await verify2FA(twoFAToken, otp);
      localStorage.setItem('token', res.data.token);

      const decoded = jwtDecode(res.data.token);
      if (decoded) localStorage.setItem('user', JSON.stringify(decoded));

      showSnackbar('2FA verified! Login complete.');
      setOtpModalOpen(false);

      setTimeout(() => {
        if (decoded.role.toLowerCase() === "doctor") {
          navigateDoctorRoute(decoded);
        } else {
          navigate(`/${decoded.role.toLowerCase()}/dashboard`, { replace: true });
        }
      }, 500);
    } catch (err) {
      showSnackbar(err.response?.data?.message || '2FA verification failed', 'error');
    }
  };

  return (
    <AuthLayout bgImage="/assets/login-bg.svg">
      <AuthCard title="Login">
        <InputField
          label="Email or Username"
          name="emailOrUsername"
          value={form.emailOrUsername}
          onChange={handleChange}
          icon={<EmailIcon />}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          icon={<LockIcon />}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </AuthCard>

      <OTPModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerify={handleVerify2FA}
      />

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

export default LoginPage;
