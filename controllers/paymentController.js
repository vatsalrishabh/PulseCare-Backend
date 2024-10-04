const Razorpay = require('razorpay');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const Payment = require('../models/Payment');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'rzp_live_1MxULmQnXguann', // Replace with your Razorpay key_id
  key_secret: '8WyMGYphteSpi3rBUw6zD8fC', // Replace with your Razorpay key_secret
});

// Function to create an order
const createOrder = async (req, res) => {
  console.log(req.body+"The create order api is triggered");
  try {
    const { amount, currency, receipt, notes } = req.body;
    console.log(amount+" "+currency+" "+receipt+" "+notes+" "+"The create order api is triggered");

    const options = {
      amount: amount * 100, // Convert amount to paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);

    const bookingId = receipt;
    const receiptDetails = await Payment.findOne({ bookingId: receipt });
    
    // Check if the receipt already exists
  
      await Payment.create({ amount, currency, bookingId, notes, razorOrderId: order.id });


    res.json(order); // Send order details to frontend, including order ID
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
};

// Function to verify payment
// Function to verify payment
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_status } = req.body;

  const secret = razorpay.key_secret;
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
    
    if (isValidSignature) {
      const paymentRecord = await Payment.findOne({ razorOrderId: razorpay_order_id });

      if (paymentRecord) {
        if (payment_status === 'failed') {
          await Payment.updateOne(
            { razorOrderId: razorpay_order_id },
            { $set: { razorPaymentId: razorpay_payment_id, status: 'failed', updatedAt: Date.now() } }
          );
        } else {
          await Payment.updateOne(
            { razorOrderId: razorpay_order_id },
            { $set: { razorPaymentId: razorpay_payment_id, status: 'success', updatedAt: Date.now() } }
          );
        }
      }
      res.status(200).json({ status: 'ok' });
      console.log("Payment verification successful");
    } else {
      res.status(400).json({ status: 'verification_failed' });
      console.log("Payment verification failed");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }
};


// Exporting the functions
module.exports = {
  createOrder,
  verifyPayment,
};
