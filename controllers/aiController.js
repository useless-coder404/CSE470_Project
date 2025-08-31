const callLLM = require('../utils/llmBridge');
const AIInteractionLog = require('../models/AIInteractionLog');
const { logAction } = require('../utils/log');
const sanitizeInput = require('../utils/sanitizeInput');

const diagnoseSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ message: 'Symptoms required' });
    
    const cleanSymptoms = sanitizeInput(symptoms);
    
    const prompt = `
You are a medical assistant AI. A patient reports: "${cleanSymptoms}".
Provide:
1. Likely conditions (brief)
2. Urgency level (low / medium / high)
3. Suggested next steps for the patient
Return your answer in a single concise paragraph.`;

    const diagnosis = await callLLM(req.user._id, prompt, 'diagnosis');

    // Save to AIInteractionLog
    await AIInteractionLog.create({
      userId: req.user._id,
      input: prompt,
      output: diagnosis || 'No response',
      type: 'diagnosis',
    });

    res.json({ diagnosis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const chatSymptoms = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const cleanMessage = sanitizeInput(message);
    
    const prompt = `
You are a medical assistant AI chatting with a patient.
Patient asks: "${cleanMessage}".
Continue the conversation naturally, ask follow-up questions if needed, and give helpful advice.`;

    const reply = await callLLM(req.user._id, prompt, 'chat');

    // Save to AIInteractionLog
    await AIInteractionLog.create({
      userId: req.user._id,
      input: prompt,
      output: reply || 'No response',
      type: 'chat',
    });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const simplifyMedicalTerm = async (req, res) => {
  try {
    const { term } = req.body;
    if (!term) return res.status(400).json({ message: 'Term required' });
    
    const cleanTerm = sanitizeInput(term);

    const prompt = `
You are a medical assistant AI.
Explain this medical term in simple, patient-friendly language: "${cleanTerm}".
Keep it short and easy to understand.`;

    const simple = await callLLM(req.user._id, prompt, 'simplifier');

    // Save to AIInteractionLog
    await AIInteractionLog.create({
      userId: req.user._id,
      input: prompt,
      output: simple || 'No response',
      type: 'simplifier',
    });

    res.json({ explanation: simple });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getVisitPrep = async (req, res) => {
  try {
    const { condition } = req.params;
    if (!condition) return res.status(400).json({ message: 'Condition required' });

    const cleanCondition = sanitizeInput(condition);

    const prompt = `
You are a medical assistant AI.
Provide a checklist for a patient visiting a doctor for: "${cleanCondition}".
Include necessary documents, medicines, tests, and any preparation tips.`;

    const checklist = await callLLM(req.user._id, prompt, 'prep');

    // Save to AIInteractionLog
    await AIInteractionLog.create({
      userId: req.user._id,
      input: prompt,
      output: checklist || 'No response',
      type: 'prep',
    });

    res.json({ checklist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const viewAILogs = async (req, res) => {
  try {
    const logs = await AIInteractionLog.find()
      .select('-userId')  // anonymized for admin
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { diagnoseSymptoms, chatSymptoms, simplifyMedicalTerm, getVisitPrep, viewAILogs };