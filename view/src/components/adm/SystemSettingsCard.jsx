import React, { useState } from "react";
import { Card, CardContent, Typography, FormControlLabel, Switch, Button, Stack } from "@mui/material";

const SystemSettingsCard = ({ settings = {}, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState({
    voiceInputEnabled: settings.voiceInputEnabled || false,
    aiChatLogsEnabled: settings.aiChatLogsEnabled || false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLocalSettings({ ...localSettings, [e.target.name]: e.target.checked });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(localSettings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent>
        <Typography variant="h6" mb={2} color="primary.main">
          System Settings
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.voiceInputEnabled}
                onChange={handleChange}
                name="voiceInputEnabled"
              />
            }
            label="Voice Input Enabled"
          />
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.aiChatLogsEnabled}
                onChange={handleChange}
                name="aiChatLogsEnabled"
              />
            }
            label="AI Chat Logs Enabled"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SystemSettingsCard;
