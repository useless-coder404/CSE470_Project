const HealthLog = require('../models/HealthLog');
const User = require('../models/User');

const createHealthLog = async (req, res) => {
    try {
        const healthLog = await HealthLog.create({
            userId: req.user._id,
            ...req.body,
        });
        
        res.status(201).json({ success: true, data: healthLog });
    
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getHealthLogs = async (req, res) => {
  try {
    const userRole = req.user.role;
    let logs;

    if (userRole === 'user') {
      // User gets only their own logs
      logs = await HealthLog.find({ userId: req.user._id })
        .select('date symptoms mood vitals notes height weight')  // only fields user needs
        .sort({ date: -1 });
    } else if (userRole === 'doctor') {
      // For now, return all logs (replace with your logic to get only doctor's patients logs)
      logs = await HealthLog.find()
        .select('userId date symptoms mood vitals notes height weight')
        .sort({ date: -1 });
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching health logs' });
  }
};


const getHealthLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await HealthLog.findById(id);

    if (!log) {
      return res.status(404).json({ message: 'Health log not found' });
    }

    const userRole = req.user.role;

    // Access control: users can only get their own logs, doctors can get any (or apply your logic)
    if (userRole === 'user' && log.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Optional: For doctors, you can restrict to only their patients' logs if needed

    res.json({ status: 'success', data: log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching health log' });
  }
};


const updateHealthLog = async (req, res) => {
    try {
        const healthLog = await HealthLog.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!healthLog) {
            return res.status(404).json({ success: false, error: 'Health log not found' });
        }
        
        res.status(200).json({ success: true, data: healthLog });
    
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const deleteHealthLog = async (req, res) => {
    try {
        const healthLog = await HealthLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        
        if (!healthLog) {
            return res.status(404).json({ success: false, error: 'Health log not found' });
        }
        
        res.status(200).json({ success: true, message: 'Health log deleted' });
    
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


module.exports = { createHealthLog, getHealthLogs, getHealthLog, updateHealthLog, deleteHealthLog, };