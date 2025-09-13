import API from "../../api/api";

export const getReminders = async () => {
  try {
    const res = await API.get("/auth/reminders");
    return res.data.data || [];
  } catch (err) {
    console.error("Failed to fetch reminders:", err);
    throw err;
  }
};

export const createReminder = async (reminderData) => {
  try {
    const res = await API.post("/auth/reminders", reminderData);
    return res.data.data;
  } catch (err) {
    console.error("Failed to create reminder:", err);
    throw err;
  }
};

export const updateReminder = async (id, reminderData) => {
  try {
    const res = await API.patch(`/auth/reminders/${id}`, reminderData);
    return res.data.data;
  } catch (err) {
    console.error("Failed to update reminder:", err);
    throw err;
  }
};

export const deleteReminder = async (id) => {
  try {
    const res = await API.delete(`/auth/reminders/${id}`);
    return res.data;
  } catch (err) {
    console.error("Failed to delete reminder:", err);
    throw err;
  }
};
