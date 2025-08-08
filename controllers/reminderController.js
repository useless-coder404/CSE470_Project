const Reminder = require("../models/Reminder");
const Notification = require("../models/Notification");

const createReminder = async (req, res) => {
    try {
        const { medicineName, dosage, time, repeat, notes } = req.body;

        const reminder = new Reminder({
            userId: req.user._id,
            medicineName,
            dosage,
            time,
            repeat,
            notes,
        });

        await reminder.save();

        // Create notification
        await Notification.create({
            userId: req.user._id,
            title: "New Reminder Set",
            message: `Reminder for ${medicineName} at ${time}`,
            type: "reminder",
        });

        res.status(201).json({ success: true, message: 'Reminder created', data: reminder });

    } catch (error) {
        console.error('Create Reminder Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create reminder' });
    }
};

const getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user._id }).sort({ time: 1 });
        res.status(200).json({ success: true, data: reminders });
    } catch (error) {
        console.error('Get Reminders Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
    }
};

const updateReminder = async (req, res) => {
    try {
        const updated = await Reminder.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }

        // Notification for update
        await Notification.create({
            userId: req.user._id,
            title: "Reminder Updated",
            message: `Reminder for ${updated.medicineName} has been updated.`,
            type: "reminder",
        });

        res.status(200).json({ success: true, message: 'Reminder updated', data: updated });
    } catch (error) {
        console.error('Update Reminder Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update reminder' });
    }
};

const deleteReminder = async (req, res) => {
    try {
        const deleted = await Reminder.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }

        // Notification for delete
        await Notification.create({
            userId: req.user._id,
            title: "Reminder Deleted",
            message: `Reminder for ${deleted.medicineName} has been deleted.`,
            type: "reminder",
        });

        res.status(200).json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        console.error('Delete Reminder Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete reminder' });
    }
};

module.exports = { createReminder, getReminders, updateReminder, deleteReminder };
