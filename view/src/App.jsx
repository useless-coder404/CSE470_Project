import { Routes, Route } from "react-router-dom";
import React from "react";

// Layouts
import PublicLayout from "./layouts/PublicLayout";

//Routes
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
import Home from "./pages/home/Home";
import FeaturesPage from "./pages/home/Feature";
import LoginPage from "./pages/home/Login";
import Register from "./pages/home/Register";
import SearchDoctorPage from "./pages/home/SearchDoctor";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import ProfilePage from "./pages/user/ProfilePage";
import HealthLogsPage from "./pages/user/HealthLogsPage";
import RemindersPage from "./pages/user/RemindersPage";
import AppointmentsPage from "./pages/user/AppointmentsPage";
import PrescriptionsPage from "./pages/user/PrescriptionsPage";
import AIPage from "./pages/user/AIPage";
import EmergencyPage from "./pages/user/EmergencyPage";

// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorUploadPage from "./pages/doctor/DoctorUpload";
import AppointmentPage from "./pages/doctor/Appoinment";
import PatientsPage from "./pages/doctor/Patient";
import DoctorProfilePage from "./pages/doctor/DoctorProfile";



// Admin pages
import Dashboard from "./pages/adm/Dashboard";
import DoctorManagement from "./pages/adm/Doctormanagement";
import UserManagement from "./pages/adm/UserManagement";
import Logs from "./pages/adm/Logs";
import SystemSettings from "./pages/adm/SystemSettings";
import Notifications from "./pages/adm/Notification";
import Hospitals from "./pages/adm/Hospitals";


function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/search-doctor" element={<SearchDoctorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route index element={<Dashboard />} />                 
          <Route path="dashboard" element={<Dashboard />} />     
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="users" element={<UserManagement />} />    
          <Route path="logs" element={<Logs />} />                
          <Route path="system-settings" element={<SystemSettings />} /> 
          <Route path="hospitals" element={<Hospitals />} />      
          <Route path="notifications" element={<Notifications />} /> 
      </Route>

      {/* User routes */}
      <Route path="/user" element={<ProtectedRoute role="user" />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="healthlogs" element={<HealthLogsPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="emergency" element={<EmergencyPage />} />

      </Route>

      {/* Doctor routes */}
      <Route path="/doctor" element={<ProtectedRoute role="doctor" />}>
        <Route index element={<DoctorDashboard />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="upload-docs" element={<DoctorUploadPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="appointments" element={<AppointmentPage />} />
          <Route path="patients" element={<PatientsPage />} />

      </Route>
    </Routes>
  );
}

export default App;
