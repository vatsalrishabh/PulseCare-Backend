const mongoose = require('mongoose');
const DateBookings = require('../models/DateBookings'); // Adjust the path as necessary
const moment = require('moment'); // To manage dates easily
const cron = require('node-cron');

// Function to create booking slots for a specific date
const createBookingSlots = (date) => {
  const slots = [];
  const startTime = moment(date).startOf('day').hour(9); // Start at 09:00 AM
  const endTime = moment(date).startOf('day').hour(17); // End at 05:00 PM

  for (let time = startTime.clone(); time.isBefore(endTime); time.add(45, 'minutes')) {
    const bookingId = `${moment(date).format('YY').toUpperCase()}${moment(date).format('MMM').toUpperCase()}${time.format('DD')}${time.format('HHmm')}`; // Format bookingId
    slots.push({
      bookingId: bookingId, // New booking ID format
      time: time.format('HH:mm'),
      status: 'available', // Set status to available
      bookedby: 'NA', // Default value
      bookedOn: 'NA', // Default value
    });
  }

  return slots;
};

// Function to create records for the next three months
const createAutoDateRecords = async () => {
  const today = moment().startOf('day');
  const endDate = today.clone().add(3, 'months'); // 3 months from today

  for (let date = today.clone(); date.isBefore(endDate); date.add(1, 'days')) {
    const formattedDate = date.format('DD-MM-YYYY');

    const existingBooking = await DateBookings.findOne({ date: formattedDate });
    if (!existingBooking) {
      const slots = createBookingSlots(date); // Pass date to createBookingSlots
      const newBooking = new DateBookings({
        date: formattedDate,
        slots,
      });

      await newBooking.save();
      console.log(`Created booking for date: ${formattedDate}`);
    } else {
      console.log(`Booking for date ${formattedDate} already exists. Updating slots...`);

      const existingSlots = existingBooking.slots;
      const newSlots = createBookingSlots(date); // Pass date to createBookingSlots

      for (const newSlot of newSlots) {
        const slotIndex = existingSlots.findIndex(slot => slot.time === newSlot.time);
        if (slotIndex === -1 || existingSlots[slotIndex].status !== 'available') {
          existingBooking.slots.push(newSlot);
        }
      }

      await existingBooking.save(); // Save updates to existing booking
      console.log(`Updated slots for date: ${formattedDate}`);
    }
  }
};

// Schedule the task to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled job to create booking slots...');
  createAutoDateRecords().catch(err => {
    console.error('Error creating booking slots:', err);
  });
});

// Export the function
module.exports = {
  createAutoDateRecords,
};
