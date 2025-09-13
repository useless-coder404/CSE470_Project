const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    voiceInputEnabled: {
        type: Boolean,
        default: true
    },
    aiChatLogsEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
module.exports = SystemSettings;
