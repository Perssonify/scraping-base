const mongoose = require('mongoose');

async function connect(uri) {
  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function disconnect() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

module.exports = { connect, disconnect };
