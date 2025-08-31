const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const aiInteractionLogSchema = new Schema({
  userId: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  input: { 
    type: String, 
    required: true,
    trim: true
  },
  output: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['diagnosis', 'chat', 'simplifier', 'prep', 'emergency'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

aiInteractionLogSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('AIInteractionLog', aiInteractionLogSchema);
