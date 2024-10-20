const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, paymentSuccess} = require('../controllers/paymentController')


// Route to handle order creation
router.post('/create-order', createOrder);   //BaseUrl/api/razorpay/create-order

// Route to handle payment verification
router.post('/verify-payment',verifyPayment);  //http://localhost:3000/api/razorpay/create-order


router.post('/payment-success',paymentSuccess);  //http://localhost:3000/api/razorpay/payment-success

module.exports = router;