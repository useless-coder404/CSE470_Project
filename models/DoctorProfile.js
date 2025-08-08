const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true, 
            unique: true 
        },
        documents: [
            {
            filename: String,
            filetype: String,
            status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
            }
        ],
        specialty: { type: String },
        bio: { type: String },
        clinicLocation: {
            type:{ 
                type: String,
                enum: ['Point'], 
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true, 
            }
        },
        phone: { type: String },
        rating: { type: Number, default: 0 },
        experience: { type: Number }, // in years
        availability: [
            {
                day: {
                    type: String,
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    required: true
                },
                startTime: {
                    type: String,
                    required: true
                },
                endTime: {
                    type: String,
                    required: true
                }
            }
        ],

        fees: {type: Number},
        credentials: {
            fileUrl: String,
            status: { 
                type: String, 
                enum: ['Pending', 'Verified', 'Rejected'], 
                default: 'Pending' 
            },
            feedback: {type: String}
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date 
    }, 

    { 
        timestamps: true 
    }
);

doctorProfileSchema.index({ clinicLocation: '2dsphere' });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
