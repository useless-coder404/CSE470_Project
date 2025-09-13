import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DoctorProvider } from "./context/DoctorContext";
import { BrowserRouter } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: { default: "#f5f5f5" },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <DoctorProvider>
          <App />
        </DoctorProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
