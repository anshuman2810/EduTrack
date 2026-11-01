const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-15):
    // Strict environment variable configuration; zero hardcoded fallback credentials!
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('FATAL CONFIGURATION ERROR: MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
