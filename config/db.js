const mongoose = require('mongoose');
const { MONGO_URL } = require('../secret');

const connectDB = async (options = {}) => {
    try {
        await mongoose.connect(MONGO_URL, options);
        console.log('Connection to MongoDB is Successfully Established.');
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB Connection Error: ', error);
        });

        mongoose.connection.once('open', () => {
            console.log('MongoDB connection is open.')
        });

        if (process.env.NODE_ENV == 'development') {
            mongoose.set('debug', true);
        }

    } catch (error) {
        console.error('Could not Connected to MongoDB: ', error.toString());
        process.exit(1);
    }
};

module.exports = connectDB;