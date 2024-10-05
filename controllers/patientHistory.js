const PatientHistory = require('../models/PatientHistory'); // Adjust path as necessary
const Payment = require('../models/Payment'); // Adjust path as necessary
const DateBookings = require('../models/DateBookings');

// Function to post patient history
const postPatientHistory = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a patient history entry with the provided email already exists
    let existingHistory = await PatientHistory.findOne({ email });

    if (existingHistory) {
      // If it exists, update the existing history with the new data
      existingHistory.allergies = { ...existingHistory.allergies, ...req.body.allergies };
      existingHistory.surgicalHistory = { ...existingHistory.surgicalHistory, ...req.body.surgicalHistory };
      existingHistory.medicalHistory = { ...existingHistory.medicalHistory, ...req.body.medicalHistory };
      existingHistory.ongoingConditions = { ...existingHistory.ongoingConditions, ...req.body.ongoingConditions };
      existingHistory.currentMedications = { ...existingHistory.currentMedications, ...req.body.currentMedications };
      existingHistory.familyHistory = { ...existingHistory.familyHistory, ...req.body.familyHistory };
      existingHistory.lifestyle = { ...existingHistory.lifestyle, ...req.body.lifestyle };
      existingHistory.mentalHealth = { ...existingHistory.mentalHealth, ...req.body.mentalHealth };
      existingHistory.immunization = { ...existingHistory.immunization, ...req.body.immunization };
      existingHistory.screenings = { ...existingHistory.screenings, ...req.body.screenings };
      existingHistory.additionalInfo = req.body.additionalInfo || existingHistory.additionalInfo; // Update additionalInfo if provided

      // Save the updated history
      await existingHistory.save();
      return res.status(200).json(existingHistory);
    } else {
      // If it does not exist, create a new entry
      const newPatientHistory = new PatientHistory(req.body);
      await newPatientHistory.save();
      return res.status(201).json(newPatientHistory);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

// Function to get upcoming bookings by email
const upcomingBookings = async (req, res) => {
  try {
    const { email } = req.body;

    // Step 1: Find payments associated with the provided email
    const payments = await Payment.find({ "notes.email": email });

    // Check if any payments were found
    if (payments.length === 0) {
      return res.status(404).json({ message: 'No upcoming bookings found for this email.' });
    }

    // Step 2: Create an array to hold the booking details
    const bookingDetails = await Promise.all(payments.map(async (payment) => {
      const bookingId = payment.bookingId;
      
      // Step 3: Find the corresponding DateBookings entry for each bookingId
      const dateBooking = await DateBookings.findOne({ "slots.bookingId": bookingId });

      // If no corresponding date booking is found, skip this payment
      if (!dateBooking) {
        return null; // Skip this payment
      }

      // Find the specific slot related to the bookingId
      const slot = dateBooking.slots.find(slot => slot.bookingId === bookingId);

      // Return the combined details
      return {
        bookingId,
        slotTime: slot ? slot.time : null,
        status: slot ? slot.status : null,
        paymentInfo: payment // Include any additional payment information if needed
      };
    }));

    // Filter out any null values (where dateBooking wasn't found)
    const validBookingDetails = bookingDetails.filter(detail => detail !== null);

    // Step 4: Send the combined response
    res.status(200).json(validBookingDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bookings', error });
  }
};


module.exports = { postPatientHistory, upcomingBookings };
