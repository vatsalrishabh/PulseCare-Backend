const Razorpay = require('razorpay');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const Payment = require('../models/Payment');
const DateBookings = require('../models/DateBookings');

// Initialize Razorpay
const razorpay = new Razorpay({
  // key_id: 'rzp_live_1MxULmQnXguann', 
  // key_secret: '8WyMGYphteSpi3rBUw6zD8fC', 
  key_id: 'rzp_test_l0gnUnaG8U4VmM', 
  key_secret: '5ji43g1ji2Hnz1f1DJWpNX4T', 
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


const paymentSuccess = async (req, res) => {
  // Send HTML content directly
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Success</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin: 50px;
            }
            .success-message {
                color: green;
                font-size: 24px;
                margin-top: 20px;
            }
            .thank-you {
                font-size: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Payment Successful!</h1>
        <p class="success-message">Thank you for your payment.</p>
        <p class="thank-you">Your transaction was completed successfully.</p>
    </body>
    </html>
  `);
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

          console.log(+paymentRecord.bookingId);
          await DateBookings.updateOne(
            { "slots.bookingId": paymentRecord.bookingId }, // Match the booking date and booking ID
            {
              $set: {
                "slots.$.status": "booked", // Update the status of the matched slot
                "slots.$.bookedOn": new Date() // Set the booking date to the current date/time
              }
            }
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
  paymentSuccess,
};
