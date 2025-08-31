const sanitizeInput = require('../utils/sanitizeInput');
const { sendAlertToContact } = require('../utils/alertService');
const { findNearestHospital } = require('../utils/geo');
const EmergencyEvent = require('../models/EmergencyEvent');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const triggerEmergency = async (req, res) => {
  try {
    const userId = req.user._id;
    const { message, contacts = [], location } = req.body;

    if (!message) return res.status(400).json({ message: 'Message required' });
    if (!location || typeof location.lat === 'undefined' || typeof location.lng === 'undefined') {
      return res.status(400).json({ message: 'User location (lat,lng) is required' });
    }

    const cleanMessage = sanitizeInput(message);
    const cleanContacts = (contacts || []).slice(0, 5).map(c => ({
      name: sanitizeInput(c.name || ''),
      phone: sanitizeInput(c.phone || ''),
      email: sanitizeInput(c.email || ''),
      relation: sanitizeInput(c.relation || '')
    }));

    // find nearest hospital from DB
    const hospital = await findNearestHospital(location.lat, location.lng, 20); // 20km max

    const eventDoc = new EmergencyEvent({
      userId,
      hospitalId: hospital ? hospital._id : undefined,
      message: cleanMessage,
      contacts: cleanContacts,
      location: { type: 'Point', coordinates: [parseFloat(location.lng), parseFloat(location.lat)] },
      status: 'queued',
    });

    await eventDoc.save();

    await AuditLog.create({
      action: 'Emergency Alert Triggered',
      performedBy: userId,
      details: { eventId: eventDoc._id, hospitalId: hospital ? hospital._id : null }
    });

    // Compose alert message
    const title = 'Emergency Alert from Health Assistant';
    const composedMessage = [
      `Emergency reported by userId: ${userId}`,
      `Location: https://www.google.com/maps?q=${location.lat},${location.lng}`,
      `Message: ${cleanMessage}`
    ].join('\n');

    // target recipients
    const recipients = [];

    // nearest hospital (if found)
    if (hospital) {
      recipients.push({
        name: hospital.name,
        email: hospital.email,
        relation: 'hospital',
        hospitalId: hospital._id,
      });
    }

    // patient's assigned doctor (if present)
    const user = await User.findById(userId).populate('doctorProfile');
    if (user && user.doctorProfile) {
      const docUser = await User.findOne({ doctorProfile: user.doctorProfile._id, role: 'doctor' });
      if (docUser) {
        recipients.push({ name: docUser.name, email: docUser.email, relation: 'doctor', userId: docUser._id });
      }
    }

    // user's emergency contact(s)
    if (cleanContacts.length) {
      cleanContacts.forEach(c => recipients.push(c));
    } else if (user && user.emergencyContact) {
      recipients.push({
        name: user.emergencyContact.name || 'Emergency Contact',
        email: user.emergencyContact.email,
        relation: user.emergencyContact.relation || 'family'
      });
    }

    const seen = new Set();
    const finalRecipients = recipients.filter(r => {
      const id = r.email || '';
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // send alerts
    const results = [];
    for (const rcpt of finalRecipients) {
      const result = await sendAlertToContact(rcpt, title, composedMessage);
      results.push({ rcpt, result });
    }

    eventDoc.status = results.some(r => r.result?.email?.success) ? 'sent' : 'failed';
    eventDoc.meta = { results };
    await eventDoc.save();

    return res.status(200).json({
      status: 'success',
      message: 'Emergency alert processed',
      hospital: hospital ? { id: hospital._id, name: hospital.name, email: hospital.email } : null,
      resultsSummary: results.map(r => ({
        to: r.rcpt,
        email: r.result.email,
        notification: r.result.notification
      }))
    });
  } catch (error) {
    console.error('Emergency trigger error:', error);
    return res.status(500).json({ message: 'Failed to trigger emergency alert', error: error.message });
  }
};

module.exports = { triggerEmergency };
