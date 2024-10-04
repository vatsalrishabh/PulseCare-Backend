const mongoose = require('mongoose');

// Define the booking slot schema
const bookingSlotSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['available', 'not available', 'booked'],
    default: 'available',
  },
  bookedby: { type: String, default: 'NA' },
  bookedOn: { type: String, default: 'NA' },
});

// Define the date bookings schema
const dateBookingsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: 'DD-MM-YYYY'
  slots: [bookingSlotSchema], // Array of booking slots
});

// Create the model
const DateBookings = mongoose.model('DateBookings', dateBookingsSchema);

module.exports = DateBookings;
