const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB database
require('./db');

// Middleware to parse JSON bodies
app.use(express.json()); // Handles JSON parsing
app.use(cors({
  origin: '*', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type'], // Allow these headers
}));

// Patient routes
app.use('/api/patients', require('./routes/patient'));

// Doctor routes
app.use('/api/doctors', require('./routes/doctor'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
