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



const postBookingsAdmin = async (req, res) => {
  console.log(req.body);
  const { bookingId, date, status, bookedBy, bookedOn } = req.body;

  try {
    // Find the booking entry for the given date
    const dateBooking = await DateBookings.findOne({ date });

    if (!dateBooking) {
      return res.status(404).json({ message: 'No bookings found for the selected date' });
    }

    // Find the slot based on bookingId
    const slot = dateBooking.slots.find(slot => slot.bookingId === bookingId);

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Update the slot status based on the provided status
    if (status === 'booked') {
      if (slot.status === 'available') {
        slot.status = 'booked';
        slot.bookedBy = bookedBy;
        slot.bookedOn = bookedOn;
        await dateBooking.save();
        return res.status(200).json({ message: 'Booking successful' });
      } else {
        return res.status(400).json({ message: 'Slot not available for booking' });
      }
    } else if (status === 'not available') {
      slot.status = 'not available';
      await dateBooking.save();
      return res.status(200).json({ message: 'Slot marked as not available' });
    } else if (status === 'available') {
      slot.status = 'available';
      delete slot.bookedBy; // Remove bookedBy if slot is available
      delete slot.bookedOn; // Remove bookedOn if slot is available
      await dateBooking.save();
      return res.status(200).json({ message: 'Slot marked as available' });
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const postMultipleBookingsAdmin = async (req, res) => {
  console.log(req.body);
  const { checkBoxSlots } = req.body; // Extracting array of slots to be updated

  // Valid statuses for the slot
  const validStatuses = ['available', 'booked', 'not available', 'requested'];

  try {
    // Loop through each slot in the array and update accordingly
    for (let i = 0; i < checkBoxSlots.length; i++) {
      const { bookingId, date, status, bookedBy, bookedOn } = checkBoxSlots[i];

      // Validate the provided status
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status for bookingId: ${bookingId}` });
      }

      // Find the booking entry for the given date
      const dateBooking = await DateBookings.findOne({ date });

      if (!dateBooking) {
        return res.status(404).json({ message: `No bookings found for the selected date: ${date}` });
      }

      // Find the slot based on bookingId
      const slot = dateBooking.slots.find(slot => slot.bookingId === bookingId);

      if (!slot) {
        return res.status(404).json({ message: `Slot not found for bookingId: ${bookingId}` });
      }

      // If the status is different from the current, update it
      if (slot.status !== status) {
        slot.status = status;

        if (status === 'booked') {
          // Set the booking information when status is 'booked'
          slot.bookedBy = bookedBy;
          slot.bookedOn = bookedOn;
        } else {
          // Remove booking info when status is not 'booked'
          delete slot.bookedBy;
          delete slot.bookedOn;
        }
      }

      // Save the updated dateBooking after modifying the slot
      await dateBooking.save();
    }

    return res.status(200).json({ message: 'All slots updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




module.exports = {
  getBookings,
  postBookings,
  postBookingsAdmin,
  postMultipleBookingsAdmin,
};
