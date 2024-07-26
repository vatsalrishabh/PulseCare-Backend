const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

require('./db');
// Middleware to parse JSON bodies
app.use(express.json());

// Patient routes
app.use('/patients', require('./routes/patient'));

// Doctor routes
app.use('/doctors', require('./routes/doctor'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
