const DateBookings = require('../models/DateBookings');

// GET bookings for available dates
const getBookings = async (req, res) => {
  try {
    const bookings = await DateBookings.find(); // Adjust according to your data structure
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST booking confirmation
const postBookings = async (req, res) => {
  const { bookingId, date, bookedBy, bookedOn } = req.body;

  try {
    const dateBooking = await DateBookings.findOne({ date });
    const slot = dateBooking.slots.find(slot => slot.bookingId === bookingId);

    if (slot && slot.status === 'available') {
      slot.status = 'booked';
      slot.bookedBy = bookedBy;
      slot.bookedOn = bookedOn;
      await dateBooking.save();
      return res.status(200).json({ message: 'Booking successful' });
    }

    return res.status(400).json({ message: 'Slot not available' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBookings,
  postBookings,
};
