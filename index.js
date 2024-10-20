const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const {createAutoDateRecords}  = require('./controllers/autoDateController')
const port = process.env.PORT || 3000;


// Connect to MongoDB database
require('./db');

createAutoDateRecords();

// Middleware to parse JSON bodies
app.use(express.json()); // Handles JSON parsing
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type'], // Allow these headers
}));
app.use(express.static(path.join(__dirname, 'uploads')));


// Patient routes
app.use('/api/patients', require('./routes/patient'));

// Doctor routes
app.use('/api/doctors', require('./routes/doctor'));

// Razorpay payment Routes
app.use('/api/razorpay', require('./routes/paymentRoutes'));



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});





// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
