import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    switch (user.role.toLowerCase()) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "user":
        return <Navigate to="/user/dashboard" replace />;
      case "doctor":
        if (user.verificationStatus === "Pending" && user.docsUploaded === "false") {
          return <Navigate to="/doctor/upload-docs" replace />;
        }
        if (user.verificationStatus === "Pending" && user.docsUploaded === "true") {
          return <Navigate to="/doctor/upload-docs" replace />;
        }
        if (user.verificationStatus === "Rejected" && user.docsUploaded === "true") {
          return <Navigate to="/doctor/upload-docs" replace />;
        }
        return <Navigate to="/doctor/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
