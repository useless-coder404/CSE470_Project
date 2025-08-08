const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

// Book appointment
const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, reason } = req.body;
        const userId = req.user._id;

        const appointment = new Appointment({
            userId,
            doctorId,
            date,
            reason,
            status: 'Pending',
        });

        await appointment.save();

        // Notify patient
        await Notification.create({
            userId: patientId,
            title: "Appointment Booked",
            message: `Your appointment is scheduled for ${date}`,
            type: "appointment",
        });

        // Notify doctor
        await Notification.create({
            userId: doctorId,
            title: "New Appointment Request",
            message: `You have a new appointment request for ${date}`,
            type: "appointment",
        });

        res.status(201).json({ status: 'success', appointment });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Reschedule appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body;
        const patientId = req.user._id;

        const appointment = await Appointment.findOne({ _id: id, patientId });

        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }

        appointment.date = date;
        appointment.status = 'Pending';
        await appointment.save();

        // Notify both
        await Notification.create({
            userId: patientId,
            title: "Appointment Rescheduled",
            message: `Your appointment has been rescheduled to ${date}`,
            type: "appointment",
        });

        await Notification.create({
            userId: appointment.doctorId,
            title: "Appointment Rescheduled",
            message: `A patient has rescheduled their appointment to ${date}`,
            type: "appointment",
        });

        res.json({ status: 'success', appointment });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Cancel appointment (Patient)
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const patientId = req.user._id;

        const appointment = await Appointment.findOne({ _id: id, patientId });

        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        // Notify both
        await Notification.create({
            userId: patientId,
            title: "Appointment Cancelled",
            message: "You have cancelled your appointment.",
            type: "appointment",
        });

        await Notification.create({
            userId: appointment.doctorId,
            title: "Appointment Cancelled",
            message: "A patient has cancelled their appointment with you.",
            type: "appointment",
        });

        res.json({ status: 'success', message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// View all appointments for a doctor
const getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const appointments = await Appointment.find({ doctorId })
            .populate("patientId", "name email")
            .sort({ date: 1 });

        res.json({ status: 'success', appointments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Mark appointment as complete
const markComplete = async (req, res) => {
    try {
        const { userId } = req.params;
        const doctorId = req.user._id;

        const appointment = await Appointment.findOne({ _id: userId, doctorId });

        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }

        if (appointment.status === "Completed") {
            return res.status(400).json({ status: 'error', message: 'Appointment already completed' });
        }

        appointment.status = 'Completed';
        await appointment.save();

        // Notify patient
        await Notification.create({
            userId: appointment.patientId,
            title: "Appointment Completed",
            message: "Your appointment has been marked as completed.",
            type: "appointment",
        });

        res.json({ status: 'success', message: 'Appointment marked complete' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Cancel appointment (Doctor)
const cancelAppointmentByDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.user._id;

        const appointment = await Appointment.findOne({ _id: id, doctorId });

        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }

        appointment.status = "Cancelled";
        await appointment.save();

        // Notify both
        await Notification.create({
            userId: appointment.patientId,
            title: "Appointment Cancelled by Doctor",
            message: "Your doctor has cancelled your appointment.",
            type: "appointment",
        });

        await Notification.create({
            userId: doctorId,
            title: "Appointment Cancelled",
            message: "You have cancelled an appointment.",
            type: "appointment",
        });

        res.json({ status: "success", message: "Appointment cancelled by doctor" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = {
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getDoctorAppointments,
    markComplete,
    cancelAppointmentByDoctor
};
