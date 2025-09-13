import React from "react";
import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";

const LogCard = ({ log }) => {
  return (
    <Card className="rounded-2xl shadow-md mb-4">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="textSecondary">
            {new Date(log.createdAt).toLocaleString()}
          </Typography>
          {log.type && <Chip label={log.type} size="small" color="primary" />}
        </Stack>
        <Typography variant="body1">{log.action || log.message}</Typography>
        {log.performedBy && (
          <Typography variant="body2" color="textSecondary">
            By: {log.performedBy?.email || "Anonymous"} ({log.performedBy?.role})
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default LogCard;
