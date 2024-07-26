const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Get the MongoDB URI from environment variables
const uri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });
