const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    symptoms: [String],
    mood: String,
    vitals: {
      temperature: { type: Number, default: null },
      heartRate: { type: Number, default: null },
      bloodPressure: { type: String, default: null },
    },
    notes: String,
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('HealthLog', healthLogSchema);
