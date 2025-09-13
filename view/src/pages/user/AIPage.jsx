import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Grid, TextField, Button, Tabs, Tab, Snackbar, Alert, CircularProgress, } from "@mui/material";
import { motion } from "framer-motion";
import Sidebar from "../../components/user/Sidebar";
import Header from "../../components/user/Header";
import Footer from "../../components/home/Footer";
import { HealthAndSafety as HealthAndSafetyIcon, Mic as MicIcon } from "@mui/icons-material";
import api from "../../api/api";

export default function AIPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("textChat");
  const [textMessage, setTextMessage] = useState("");
  const [voiceFile, setVoiceFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiInput, setAiInput] = useState(""); 
  const [aiOutput, setAiOutput] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const chatEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get("/user/notifications")
        .then((res) => setNotifications(res.data.results))
        .catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sidebarLinks = [
    { title: "Profile", link: "/user/profile" },
    { title: "Health Log", link: "/user/healthlogs" },
    { title: "Reminder", link: "/user/reminders" },
    { title: "Appointment", link: "/user/appointments" },
    { title: "Emergency", link: "/user/emergency" },
    { title: "AI Diagnostics", link: "/user/ai" },
    { title: "Prescription Reader", link: "/user/prescriptions" },
  ];

  const handleTextChat = async () => {
    if (!textMessage.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/chat/text", { message: textMessage });
      setChatHistory([...chatHistory, { role: "user", content: textMessage }, { role: "ai", content: res.data.reply }]);
      setTextMessage("");
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to send message", severity: "error" });
    }
    setLoading(false);
  };

  const handleVoiceFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setVoiceFile(e.target.files[0]);
  };

  const handleVoiceChat = async () => {
    if (!voiceFile) return;
    setLoading(true);
    const form = new FormData();
    form.append("voice", voiceFile);
    try {
      const res = await api.post("/auth/chat/voice", form, { headers: { "Content-Type": "multipart/form-data" } });
      setChatHistory([...chatHistory, { role: "user", content: res.data.text }, { role: "ai", content: res.data.reply }]);
      setVoiceFile(null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to process voice chat", severity: "error" });
    }
    setLoading(false);
  };

  const handleAiFeature = async (endpoint) => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const res = endpoint.includes("visit-prep") 
        ? await api.get(endpoint)
        : await api.post(endpoint, endpoint.includes("simplify") ? { term: aiInput } : { symptoms: aiInput });
      const output = res.data.reply || res.data.diagnosis || res.data.explanation || res.data.checklist;
      setAiOutput(output);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "AI request failed", severity: "error" });
    }
    setLoading(false);
  };

  const clearChat = () => setChatHistory([]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarTitle={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <HealthAndSafetyIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}>
              Health Assistant
            </Typography>
          </Box>
        }
        sidebarLinks={sidebarLinks}
      />

      <Box sx={{ flexGrow: 1, ml: sidebarOpen ? 30 : 0, transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={notifications} />

        <Box sx={{ flex: 1, p: 3 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 3, textAlign: "center", letterSpacing: 1 }}>
              AI Assistant
            </Typography>
          </motion.div>

          <Grid container spacing={3} direction="column">
            <Grid item>
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 2 }}>
                  <Tab value="textChat" label="Text Chat" />
                  <Tab value="voiceChat" label="Voice Chat" />
                  <Tab value="diagnose" label="Diagnose Symptoms" />
                  <Tab value="simplify" label="Simplify Term" />
                  <Tab value="visitPrep" label="Visit Prep" />
                </Tabs>

                {tab === "textChat" && (
                  <Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <TextField fullWidth label="Type your message" value={textMessage} onChange={(e) => setTextMessage(e.target.value)} />
                      <Button variant="contained" color="primary" onClick={handleTextChat} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Send"}
                      </Button>
                      <Button variant="outlined" color="error" onClick={clearChat}>
                        Clear Chat
                      </Button>
                    </Box>
                    <ChatDisplay messages={chatHistory} chatEndRef={chatEndRef} />
                  </Box>
                )}

                {tab === "voiceChat" && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                      <Button variant="contained" component="label" color="primary">
                        <MicIcon sx={{ mr: 1 }} /> Upload Voice
                        <input type="file" hidden accept="audio/*" onChange={handleVoiceFileChange} />
                      </Button>
                      <Button variant="contained" color="primary" onClick={handleVoiceChat} disabled={!voiceFile || loading}>
                        {loading ? <CircularProgress size={24} /> : "Send"}
                      </Button>
                      <Button variant="outlined" color="error" onClick={clearChat}>
                        Clear Chat
                      </Button>
                      {voiceFile && <Typography>{voiceFile.name}</Typography>}
                    </Box>
                    <ChatDisplay messages={chatHistory} chatEndRef={chatEndRef} />
                  </Box>
                )}

                {tab === "diagnose" && (
                  <AIFeatureBox label="Enter symptoms" input={aiInput} setInput={setAiInput} loading={loading} handleSubmit={() => handleAiFeature("/auth/ai/diagnose")} output={aiOutput} />
                )}

                {tab === "simplify" && (
                  <AIFeatureBox label="Enter medical term" input={aiInput} setInput={setAiInput} loading={loading} handleSubmit={() => handleAiFeature("/auth/ai/simplify")} output={aiOutput} />
                )}

                {tab === "visitPrep" && (
                  <AIFeatureBox label="Enter condition" input={aiInput} setInput={setAiInput} loading={loading} handleSubmit={() => handleAiFeature("/auth/ai/visit-prep/" + aiInput)} output={aiOutput} />
                )}

              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Footer />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

function ChatDisplay({ messages, chatEndRef }) {
  return (
    <Box sx={{ maxHeight: 300, overflowY: "auto", p: 1, border: "1px solid #eee", borderRadius: 2 }}>
      {messages.map((msg, idx) => (
        <Box key={idx} sx={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", mb: 1 }}>
          <Paper sx={{ p: 1.5, maxWidth: "70%", bgcolor: msg.role === "user" ? "primary.main" : "grey.200", color: msg.role === "user" ? "#fff" : "#000" }}>
            <Typography variant="body2">{msg.content}</Typography>
          </Paper>
        </Box>
      ))}
      <div ref={chatEndRef} />
    </Box>
  );
}

function AIFeatureBox({ label, input, setInput, handleSubmit, output, loading }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <TextField fullWidth label={label} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Submit"}
      </Button>
      {output && (
        <Paper sx={{ p: 2, borderRadius: 2, mt: 1, bgcolor: "grey.100" }}>
          <Typography variant="body2">{output}</Typography>
        </Paper>
      )}
    </Box>
  );
}
