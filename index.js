const express = require('express');
const Razorpay = require('razorpay');
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



// Middleware to parse JSON
app.use(express.json());


// Razorpay instance
const razorpay = new Razorpay({
  key_id: 'rzp_test_B8Hd7td9b59ES1',        // Replace with your Razorpay key_id
  key_secret: 'WJ3ueMHQaBz7NYE8y2YX8nSy'  // Replace with your Razorpay key_secret
});

// Endpoint to create an order
// Endpoint to create an order
app.post('/razorpay', async (req, res) => {
  console.log(req.body);
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    const options = {
      amount: amount, // amount in the smallest currency unit (paise)
      currency: currency,
      receipt: receipt,
      notes: notes
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to verify payment signature
app.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated_signature = crypto.createHmac('sha256', 'WJ3ueMHQaBz7NYE8y2YX8nSy')
                                      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                                      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});





// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
