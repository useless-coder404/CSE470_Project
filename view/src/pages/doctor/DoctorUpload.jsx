import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import UploadDocumentForm from "../../components/doctor/UploadDocumentForm";
import { getDoctorStatus } from "../../services/doctor/doctorDocumentService";
import { useNavigate } from "react-router-dom";

export default function UploadDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sidebarLinks = status === "Verified"? [
      { title: "Dashboard", link: "/doctor" },
      { title: "Profile", link: "/doctor/profile" },
      { title: "Appointments", link: "/doctor/appointments" },
      { title: "Patients", link: "/doctor/patients" },
      { title: "Upload Documents", link: "/doctor/upload-docs" },
    ]
  : [
      { title: "Upload Documents", link: "/doctor/upload-docs" },
    ];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getDoctorStatus();
        setStatus(res.data.status);
        if (res.data.status !== "Verified") {
          navigate("/doctor/upload-docs");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [navigate]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar sidebarOpen={sidebarOpen} sidebarTitle={<Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 2 }}>Doctor Panel</Typography>} sidebarLinks={sidebarLinks} />
      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={[]} />

        <Box sx={{ flex: 1, p: 3 }}>
          {status === "Pending" && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Your documents are pending verification by the admin. Please upload required documents below.
            </Alert>
          )}
          {status === "Rejected" && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Your previous documents were rejected. Please upload valid documents.
            </Alert>
          )}

          <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 3, textAlign: "center" }}>
            Upload Documents for Verification
          </Typography>

          <UploadDocumentForm />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
