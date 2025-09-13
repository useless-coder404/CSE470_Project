const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { OLLAMA_MODEL, OLLAMA_URL } = process.env;
const ChatLog = require('../models/ChatLog');
const SystemSettings = require('../models/SystemSetting');

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message required' });

        //chat history
        const previousMessages = await ChatLog.find({ user: req.user._id }).sort({ createdAt: 1 });
        const messages = previousMessages.map(m => ({
            role: m.voice ? 'user' : 'assistant',
            content: m.input
        }));

        messages.push({ role: 'user', content: message });

        // Call llm
        const response = await axios.post(`${OLLAMA_URL}/v1/chat/completions`, {
            model: OLLAMA_MODEL,
            messages
        });

        const settings = await SystemSettings.findOne();

        // Save chat log
        if (settings?.aiChatLogsEnabled) {
            await ChatLog.create({
                user: req.user._id,
                input: message,
                output: response.data.choices[0].message.content,
                voice: false
            });
        }

        return res.status(200).json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error('AI chat error:', error.message);
        return res.status(500).json({ error: 'Failed to process chat' });
    }
};

const voiceChatWithAI = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Voice file is required' });

        const audioPath = path.join(req.file.path);

        const transcribedText = await transcribeAudio(audioPath);

        const previousMessages = await ChatLog.find({ user: req.user._id }).sort({ createdAt: 1 });
        const messages = previousMessages.map(m => ({
            role: m.voice ? 'user' : 'assistant',
            content: m.input
        }));

        messages.push({ role: 'user', content: transcribedText });

        // Call llm
        const response = await axios.post(`${OLLAMA_URL}/v1/chat/completions`, {
            model: OLLAMA_MODEL,
            messages
        });

        const settings = await SystemSettings.findOne();

        if (settings?.voiceInputEnabled === false) {
            fs.unlinkSync(audioPath);
            return res.status(403).json({ error: 'Voice input is currently disabled by admin' });
        }

        if (settings?.aiChatLogsEnabled) {
            await ChatLog.create({
                user: req.user._id,
                input: transcribedText,
                output: response.data.choices[0].message.content,
                voice: true
            });
        }

        fs.unlinkSync(audioPath);

        return res.status(200).json({
            reply: response.data.choices[0].message.content,
            text: transcribedText
        });
    } catch (err) {
        console.error('AI voice chat error:', err.message);
        return res.status(500).json({ error: 'Failed to process voice chat' });
    }
};

const transcribeAudio = async (audioFilePath) => {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders()
        }
    });

    return response.data.text;
};

module.exports = { chatWithAI, voiceChatWithAI };
