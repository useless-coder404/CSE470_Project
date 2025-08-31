const sendEmail = require('./sendEmail');
const Notification = require('../models/Notification');

const sendAlertToContact = async (contact, title, message) => {
  const results = { contact, email: null, notification: null };

  // Send Email
  if (contact.email) {
    try {
      await sendEmail({
        to: contact.email,
        subject: title,
        text: message,
        html: `<p>${message}</p>`,
      });
      results.email = { success: true };
    } catch (error) {
      results.email = { success: false, error: error.message };
    }
  }

  // In-app notification
  try {
    if (contact.userId) {
      const notif = await Notification.create({
        userId: contact.userId,
        title,
        message,
        type: 'system',
      });
      results.notification = { success: true, id: notif._id };
    }
  } catch (error) {
    results.notification = { success: false, error: error.message };
  }

  return results;
};

module.exports = { sendAlertToContact };