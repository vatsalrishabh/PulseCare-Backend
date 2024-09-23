const Razorpay = require('razorpay');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'rzp_test_RYNvxWHdirjhUp', // Replace with your Razorpay key_id
  key_secret: 'FZv0JPK3HyVhoeJnBbXS9wBR', // Replace with your Razorpay key_secret
});

// Function to create an order
const createOrder = async (req, res) => {
    console.log(req.body)
  try {
    const { amount, currency, receipt, notes } = req.body;

    const options = {
      amount: amount * 100, // Convert amount to paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);

    res.json(order); // Send order details to frontend, including order ID
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
};

// Function to verify payment
const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const secret = razorpay.key_secret;
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
    if (isValidSignature) {
      // You can perform any additional actions here, like updating order status in a database
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
