const PatientHistory = require('../models/PatientHistory'); // Adjust path as necessary
const Payment = require('../models/Payment'); // Adjust path as necessary
const DateBookings = require('../models/DateBookings');
const Patient = require('../models/Patient');

// Function to post patient history
const postPatientHistory = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a patient history entry with the provided email already exists
    let existingHistory = await PatientHistory.findOne({ email });

    if (existingHistory) {
      // If it exists, update only the fields that have data in the request body
      const fieldsToUpdate = [
        'allergies',
        'surgicalHistory',
        'medicalHistory',
        'currentMedications',
        'familyHistory',
        'lifestyle',
        'mentalHealth',
        'immunization',
        'screenings',
        'additionalInfo',
      ];

      fieldsToUpdate.forEach(field => {
        if (req.body[field]) {
          Object.assign(existingHistory[field], req.body[field]);
        }
      });

      // Handle ongoingConditions specifically
      if (Array.isArray(req.body.ongoingConditions)) {
        existingHistory.ongoingConditions = req.body.ongoingConditions.map(condition => ({
          currentDiagnoses: condition.currentDiagnoses || 'None',
          duration: condition.duration || 'N/A',
          symptoms: condition.symptoms || 'None',
        }));
      }

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


const getPatientHistory = async (req, res) => {
  const { email } = req.params;
// console.log(req.params);
  try {
    const patientHistory = await PatientHistory.findOne({ email });
    
    if (!patientHistory) {
      return res.status(404).json({ message: 'Patient history not found' });
    }

    res.status(200).json(patientHistory);
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ error: error.message });
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


const getAllPatients = async (req, res) => {
  const { email } = req.query;

  try {
    let result;
    if (email) {
      // If an email is provided, find a specific patient by email
      result = await Patient.find({ email });
    } else {
      // If no email is provided, fetch all patients
      result = await Patient.find();
    }

    // Respond with the result
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'An error occurred while fetching patients.' });
  }
};

module.exports = { postPatientHistory, upcomingBookings, getPatientHistory, getAllPatients };
