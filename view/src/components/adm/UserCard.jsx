import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

const UserCard = ({ user, onAction }) => {
  return (
    <Card className="rounded-2xl shadow-md mb-4">
      <CardContent>
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {user.email}
        </Typography>
        <Typography variant="body2">
          Status: {user.isBlocked ? "Blocked" : "Active"}
        </Typography>

        <Stack direction="row" spacing={2} mt={2}>
          {user.isBlocked ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => onAction(user._id, "unblock")}
            >
              Unblock
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => onAction(user._id, "block")}
            >
              Block
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            onClick={() => onAction(user._id, "delete")}
          >
            Delete
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UserCard;
