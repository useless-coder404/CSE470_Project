require('dotenv').config();

const PORT = process.env.PORT || 5001;

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/HealthAssistant';

module.exports = { PORT, MONGO_URL };