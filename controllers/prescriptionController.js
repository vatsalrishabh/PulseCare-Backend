const Payment = require('../models/Payment');
const DateBookings = require('../models/DateBookings');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');



const getPatientId = async (req, res) => {
  const { email } = req.query;
 

  try {
    // Step 1: Find the patient by email
    const patient = await Patient.findOne({ email });

    // Check if the patient was found
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patientId = patient.patientId;

    // Step 2: Find the prescription by patientId to get the bookingId
    const prescription = await Prescription.findOne({ patientId });

    // Check if a prescription was found for the patient
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found for this patient' });
    }

    const bookingId = prescription.bookingId;

    // Send both patientId and bookingId as the response
    res.status(200).json({ patientId, bookingId });

  } catch (error) {
    console.error('Error fetching patient and booking ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query; // Accept status as a query parameter
    const paymentQuery = status ? { status } : {}; // If status is provided, filter by it
    const payments = await Payment.find(paymentQuery);

    // Fetch patients from successful payments
    const emails = payments.map(payment => payment.notes.email); // Extract emails from payments
    const patients = await Patient.find({ email: { $in: emails } }).select('patientId email name mobile sex');

    // Create a map of patient details for easy lookup
    const patientMap = patients.reduce((acc, patient) => {
      acc[patient.email] = {
        patientId: patient.patientId,
        name: patient.name,
        mobile: patient.mobile,
        sex: patient.sex
      }; // Map email to patient details
      return acc;
    }, {});

    // Create a mapping of payments by bookingId
    const paymentMap = payments.reduce((acc, payment) => {
      acc[payment.bookingId] = payment;
      return acc;
    }, {});

    // console.log(paymentMap); Log paymentMap for debugging

    // Get all bookingIds from paymentMap
    const bookingIds = Object.keys(paymentMap);

    // Query dateBookings where any slot has a bookingId from paymentMap
    const dateBookings = await DateBookings.find({
      'slots.bookingId': { $in: bookingIds }
    });

    // Assuming uniqueBookings is a Set that tracks unique bookingIds
    const uniqueBookings = new Set();

    // Initialize an empty object to store the final response
    const mergedBookings = {};

    // Merge data
    dateBookings.forEach((dateBooking) => {
      dateBooking.slots.forEach((slot) => {
        const payment = paymentMap[slot.bookingId]; // Get the payment if it exists

        // If bookingId is unique and payment is successful
        if (payment && !uniqueBookings.has(slot.bookingId)) {
          uniqueBookings.add(slot.bookingId); // Track unique bookingIds

          const patientEmail = payment.notes.email || null; // Get the email from payment notes
          const patientDetails = patientMap[patientEmail] || {}; // Get the patient details from the map

          // Structure the response with bookingId as the key
          mergedBookings[slot.bookingId] = {
            bookingId: slot.bookingId,
            date: dateBooking.date, // Add date from dateBooking
            status: slot.status, // Add status from the slot
            patientId: patientDetails.patientId || null, // Add patientId
            name: patientDetails.name || null, // Add patient name
            mobile: patientDetails.mobile || null, // Add patient mobile
            sex: patientDetails.sex || null, // Add patient sex
          };
        }
      });
    });

    // console.log(mergedBookings);  Log mergedBookings for debugging before sending the response

    // Send the merged data as a response

    res.status(200).json(mergedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const recommendTest = async (req, res) => {
  const { bookingId, patientId, test } = req.body;
  console.log(req.body)
  try {
    const updatedPrescription = await Prescription.updateOne(
      { bookingId: bookingId },
      { $push: { recommendedTest: test } },  // Add test to recommendedTest array
      { upsert: true }  // This will insert a new document if no matching document is found
    );
    if (updatedPrescription) {
      return res.status(201).json({ message: 'New prescription created and test added!' });
    } else if (updatedPrescription.nModified > 0) {
      return res.status(200).json({ message: 'Test added successfully!' });
    } else {
      return res.status(404).json({ message: 'No changes were made' });
    }
  } catch (error) {
    console.error('Error recommending test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTest = async (req, res) => {
  const { bookingId, patientId, testId } = req.body;
  try {
    const updatedPrescription = await Prescription.updateOne(
      { bookingId: bookingId },
      { $pull: { recommendedTest: { _id: testId } } } // Remove test from recommendedTest array
    );

    if (updatedPrescription.nModified > 0) {
      return res.status(200).json({ message: 'Test deleted successfully!' });
    } else {
      return res.status(404).json({ message: 'Test not found or no changes were made' });
    }
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const viewRecommendedTest = async (req, res) => {
  const { bookingId, patientId } = req.query;
  console.log(req.query);

  try {
    const prescription = await Prescription.findOne({ bookingId: bookingId, patientId: patientId });

    if (prescription) {
      return res.status(200).json(prescription.recommendedTest);
    } else {
      return res.status(404).json({ message: 'No prescription found for the given details' });
    }
  } catch (error) {
    console.error('Error fetching recommended tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const prescribeMedecine = async (req, res) => {
  console.log(req.body); // Debugging output to log the incoming request body
  try {
    // Check if a prescription with the same bookingId already exists
    const existingPrescription = await Prescription.findOne({ bookingId: req.body.bookingId });

    if (existingPrescription) {
      // If it exists, update the medicines array
      existingPrescription.medicines = req.body.medicines;

      // Save the updated prescription
      const updatedPrescription = await existingPrescription.save();

      return res.status(200).json({ 
        message: 'Medicines updated successfully for this booking ID!', 
        data: updatedPrescription 
      });
    }

    // If it does not exist, create a new prescription
    const newPrescription = new Prescription({
      patientId: req.body.patientId,
      bookingId: req.body.bookingId,
      date: req.body.date, // Ensure date is sent as ISOString
      medicines: req.body.medicines // Medicines array from the request
    });

    // Save the newly created prescription
    const savedPrescription = await newPrescription.save();

    // Respond with success and the saved prescription data
    res.status(200).json({ 
      message: 'Prescription added successfully!', 
      data: savedPrescription 
    });
  } catch (error) {
    // Error handling for issues in adding or updating prescription
    res.status(500).json({ 
      message: 'Error adding prescription', 
      error: error.message 
    });
  }
};

// Function to retrieve old prescriptions based on bookingId
const oldPrescription = async (req, res) => {
  console.log(req.body); // Debugging output to log the incoming request body
  try {
    const { bookingId } = req.body; // Destructure bookingId from the request body

    // Find prescriptions using the bookingId
    const result = await Prescription.find({ bookingId });

    // Check if any prescriptions were found for the given bookingId
    if (result.length === 0) {
      return res.status(404).json({ 
        message: 'No prescriptions found for this booking ID.' 
      });
    }

    // Respond with the found prescriptions
    res.status(200).json(result); 
  } catch (error) {
    // Error handling for issues in retrieving prescriptions
    res.status(500).json({ 
      message: 'Error retrieving prescriptions', 
      error: error.message 
    });
  }
};


const PatientOldPrescription = async (req, res) => {
  try {
    const { patientEmail } = req.body; // Correct the spelling of patientEmail
  

    // Find the patient by email to get their patient ID
    const patient = await Patient.findOne({ email: patientEmail });

    // If the patient is not found, return a 404 error
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }



    // Use patientId to find related prescriptions
    const result = await Prescription.find({ patientId: patient.patientId });

  

    // Check if any prescriptions were found for the given patient
    if (result.length === 0) {
      return res.status(404).json({ message: 'No prescriptions found for this patient.' });
    }

    // Respond with the found prescriptions
    res.status(200).json(result);
  } catch (error) {
    // Error handling for issues in retrieving prescriptions
    res.status(500).json({
      message: 'Error retrieving prescriptions',
      error: error.message,
    });
  }
};







module.exports = {
  getAllBookings,
  prescribeMedecine,
  oldPrescription,
  PatientOldPrescription,
  recommendTest,
  viewRecommendedTest,
  deleteTest,
  getPatientId,
};
