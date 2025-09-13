import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import PatientCard from "../../components/doctor/PatientCard";
import { getPatientsList } from "../../services/doctor/doctorPateientService";

export default function PatientsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { title: "Dashboard", link: "/doctor" },
    { title: "Profile", link: "/doctor/profile" },
    { title: "Appointments", link: "/doctor/appointments" },
    { title: "Patients", link: "/doctor/patients" },
    { title: "Upload Documents", link: "/doctor/upload-docs" },
  ];

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatientsList();
      setPatients(res || []);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar sidebarOpen={sidebarOpen} sidebarTitle={<Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 2 }}>Doctor Panel</Typography>} sidebarLinks={sidebarLinks} />
      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={[]} />

        <Box sx={{ flex: 1, p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 3, textAlign: "center" }}>
            My Patients
          </Typography>
          <Grid container spacing={3} direction="column">
            {patients.length ? patients.map((p) => (
              <Grid item key={p._id}><PatientCard patient={p} /></Grid>
            )) : <Typography>No patients found.</Typography>}
          </Grid>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
