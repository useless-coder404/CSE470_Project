import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/api';
import { jwtDecode } from "jwt-decode";

const DoctorContext = createContext();

const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctor = async (token) => {
    try {
      const decoded = jwtDecode(token);

      if (!decoded || decoded.role.toLowerCase() !== 'doctor') {
        return;
      }

      const res = await axios.get('/doctor/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDoctor({ ...decoded, ...res.data.doctor });
    } catch (err) {
      console.error('Error fetching doctor:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDoctor(token);
    } else {
      setLoading(false); 
    }
  }, []);

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, loading }}>
      {children}
    </DoctorContext.Provider>
  );
};

const useDoctorContext = () => useContext(DoctorContext);

export {DoctorContext, DoctorProvider, useDoctorContext}