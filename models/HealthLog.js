const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user', 
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
            temperature: Number,
            heartRate: Number,
            bloodPressure: String
        },
        notes: String,
        height: Number,  // in cm or inches 
        weight: Number,  // in kg or lbs 
    }, 
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model('HealthLog', healthLogSchema);
