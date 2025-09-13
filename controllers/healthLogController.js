const HealthLog = require('../models/HealthLog');

const createHealthLog = async (req, res) => {
  try {
    const { symptoms, mood, notes, height, weight, vitals, temperature, heartRate, bloodPressure } = req.body;

    const healthLog = await HealthLog.create({
      userId: req.user._id,
      symptoms: symptoms || [],
      mood: mood || "",
      notes: notes || "",
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      vitals: {
        temperature: vitals?.temperature ? Number(vitals.temperature) : (temperature ? Number(temperature) : null),
        heartRate: vitals?.heartRate ? Number(vitals.heartRate) : (heartRate ? Number(heartRate) : null),
        bloodPressure: vitals?.bloodPressure || bloodPressure || null,
      },
    });

    res.status(201).json({ success: true, data: healthLog });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateHealthLog = async (req, res) => {
  try {
    const { symptoms, mood, notes, height, weight, vitals, temperature, heartRate, bloodPressure } = req.body;

    const healthLog = await HealthLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $set: {
          symptoms: symptoms || [],
          mood: mood || "",
          notes: notes || "",
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
          vitals: {
            temperature: vitals?.temperature ? Number(vitals.temperature) : (temperature ? Number(temperature) : null),
            heartRate: vitals?.heartRate ? Number(vitals.heartRate) : (heartRate ? Number(heartRate) : null),
            bloodPressure: vitals?.bloodPressure || bloodPressure || null,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!healthLog) {
      return res.status(404).json({ success: false, error: 'Health log not found' });
    }

    res.status(200).json({ success: true, data: healthLog });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};


const getHealthLogs = async (req, res) => {
  try {
    const userRole = req.user.role;
    let logs;

    if (userRole === 'user') {
      logs = await HealthLog.find({ userId: req.user._id })
        .select('date symptoms mood vitals notes height weight')
        .sort({ date: -1 });
    } else if (userRole === 'doctor') {
      logs = await HealthLog.find()
        .select('userId date symptoms mood vitals notes height weight')
        .sort({ date: -1 });
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching health logs' });
  }
};

const deleteHealthLog = async (req, res) => {
  try {
    const healthLog = await HealthLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!healthLog) return res.status(404).json({ success: false, error: 'Health log not found' });

    res.status(200).json({ success: true, message: 'Health log deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { createHealthLog, updateHealthLog, getHealthLogs, deleteHealthLog };
