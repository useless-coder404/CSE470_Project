const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const emergencyEventSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: Types.ObjectId, ref: 'Hospital' },
  message: { type: String, required: true },
  contacts: [{ 
    name: String,
    phone: String,
    email: String,
    relation: String
  }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  status: { type: String, enum: ['sent','failed','queued'], default: 'queued' },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

emergencyEventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
