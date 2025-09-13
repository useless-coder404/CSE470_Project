import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const registerUser = async (data) => {
  return axios.post(`${BASE_URL}/auth/register`, data);
};

export const verifyOTP = async (data) => {
  return axios.post(`${BASE_URL}/auth/verify-otp`, data);
};

export const loginUser = async (data) => {
  return axios.post(`${BASE_URL}/auth/login`, data);
};

export const verify2FA = async (token, otp) => {
  return axios.post(`${BASE_URL}/auth/verify-2fa`, { otp }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};