const AuditLog = require('../models/AuditLog');

const logAction = async (action, userId, details = {}) => {
  if (!userId) {
    console.warn('Missing user ID for audit log');
    return;
  }

  await AuditLog.create({
    action,
    performedBy: userId,
    details,
  });
};

module.exports = { logAction };