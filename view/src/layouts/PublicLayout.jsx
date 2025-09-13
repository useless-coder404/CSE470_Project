// src/layouts/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/home/Header';
import Footer from '../components/home/Footer';

const PublicLayout = () => (
  <>
    <Header /> {/* Home page header */}
    <Outlet />
    <Footer />
  </>
);

export default PublicLayout;
