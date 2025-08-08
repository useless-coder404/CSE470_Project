const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  fileUrl: { // URL or path of uploaded file
    type: String,
    required: true,
  },
  description: String, // optional user notes or extracted text later
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
