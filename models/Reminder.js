const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user', 
            required: true 
        },
        medicineName: String,
        dosage: String,
        time: Date,
        repeat: { 
            type: String, 
            enum: ['None', 'Daily', 'Weekly'], 
            default: 'None' 
        },
        notes: String
    }, 
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model('Reminder', reminderSchema);
