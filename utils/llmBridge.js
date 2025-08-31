const axios = require('axios');
const { logAction } = require('./log');
const AIInteractionLog = require('../models/AIInteractionLog');

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:latest';
const MAX_RETRIES = 3;
const TIMEOUT_MS = 60000; // 60 seconds

const callLLM = async (userId, prompt, type = 'diagnosis') => {
  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/generate`,
        {
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: { temperature: 0.7 },
        },
        { timeout: TIMEOUT_MS }
      );

      const output = response.data?.response?.trim() || null;

      if (!output) throw new Error('Empty response from LLM');

      // Log successful call in AuditLog
      await logAction(`LLM called for ${type}`, userId, { input: prompt, output });

      // Save to AIInteractionLog
      await AIInteractionLog.create({
        userId,
        input: prompt,
        output,
        type,
      });

      return output;

    } catch (error) {
      attempt++;
      lastError = error;
      console.error(`LLM call attempt ${attempt} failed:`, error.message);

      // Log error in AIInteractionLog
      await AIInteractionLog.create({
        userId,
        input: prompt,
        output: null,
        type,
        meta: { error: error.message, attempt },
      });

      if (attempt >= MAX_RETRIES) {
        throw new Error('AI service unavailable after multiple attempts');
      }

      await new Promise(res => setTimeout(res, 1000));
    }
  }

  throw lastError;
};

module.exports = callLLM;