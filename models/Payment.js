const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
  },
  razorOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  razorPaymentId: {
    type: String,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: Object,
    default: {},
  },
  googleMeet:{
    type:String,
    default:"Na",
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
