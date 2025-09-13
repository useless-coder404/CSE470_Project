import API from "../../api/api";

export const getAuditLogs = async () => {
  const res = await API.get("/admin/logs");
  return res.data;
};

export const getAILogs = async () => {
  const res = await API.get("/admin/ai-logs");
  return res.data;
};

export const getAIChatLogs = async () => {
  const res = await API.get("/admin/ai-chat-logs");
  return res.data;
};