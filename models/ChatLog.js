const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    input: { type: String, required: true },
    output: { type: String, required: true },
    voice: { type: Boolean, default: false }
}, { timestamps: true });

const ChatLog = mongoose.model('ChatLog', chatLogSchema);
module.exports = ChatLog;
