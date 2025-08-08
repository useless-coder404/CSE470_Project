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
        height: Number,  // in cm or inches (specify in docs)
        weight: Number,  // in kg or lbs (specify in docs)
    }, 
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model('HealthLog', healthLogSchema);
