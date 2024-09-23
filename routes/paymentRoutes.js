const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment} = require('../controllers/paymentController')


// Route to handle order creation
router.post('/create-order', createOrder);

// Route to handle payment verification
router.post('/verify-payment',verifyPayment);




module.exports = router;