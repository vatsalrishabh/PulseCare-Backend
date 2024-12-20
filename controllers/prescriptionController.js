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
  const { bookingId, testId } = req.body;

  try {
    const updatedPrescription = await Prescription.updateOne(
      { bookingId: bookingId },
      { $pull: { recommendedTest: { _id: testId } } } // Remove test with specific _id from recommendedTest array
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
// Debugging output to log the incoming request body
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
 // Debugging output to log the incoming request body
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

// Controller to handle patient complaints
const patientComplaint = async (req, res) => {
  const { patientId, bookingId, complaint } = req.body;

  try {
    let prescription = await Prescription.findOne({ patientId, bookingId });

    await Prescription.updateOne(
      { patientId, bookingId },  // Filter condition to find the correct document
      { $set: { "patientComplaint": [{ Complaint: complaint }] } },  // Set or update the patientComplaint field
      { upsert: true }  // If no document matches, create a new one
    );

    res.status(200).json({ message: 'Complaint added/updated successfully' });
    

    // res.status(200).json({ message: 'Complaint added successfully', prescription });
  } catch (error) {
    console.error("Error saving complaint:", error);
    res.status(500).json({ message: 'Error saving complaint', error });
  }
};


const getPatientComplaint = async (req, res) => {
  const { patientId, bookingId } = req.query;  // Use req.query for query parameters

  try {
      let prescription = await Prescription.findOne({ patientId, bookingId });
      if (prescription) {
          res.status(200).json({ message: 'Patient Complaint', data: prescription.patientComplaint });
      } else {
          res.status(404).json({ message: 'Prescription not found' });
      }
  } catch (error) {
      console.error("Error retrieving complaint:", error);
      res.status(500).json({ message: 'Error retrieving complaint', error });
  }
};




const sendDiagnosis = async (req, res) => {

  const { patientId, bookingId, diagnosis } = req.body;

  try {
    await Prescription.updateOne(
      { patientId, bookingId },
      {
        $set: { DoctorDiagnosis: { Diagnosis: diagnosis } }
      },
      { upsert: true }
    );

    res.status(200).json({ message: 'Diagnosis added successfully' });
  } catch (error) {
    console.error("Error saving diagnosis:", error);
    res.status(500).json({ message: 'Error saving diagnosis', error });
  }
};

// Get Diagnosis function to retrieve existing diagnoses
const getDiagnosis = async (req, res) => {
  const { patientId, bookingId } = req.query;

  try {
    const prescription = await Prescription.findOne({ patientId, bookingId }, 'DoctorDiagnosis');
    res.status(200).json(prescription ? prescription.DoctorDiagnosis : []);
  } catch (error) {
    console.error("Error fetching diagnosis:", error);
    res.status(500).json({ message: 'Error fetching diagnosis', error });
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




const fetchAllPrescriptionDetails = async (req, res) => {
 // Log the query params for debugging

  const { email, bookingId } = req.query;  // Extract email and bookingId from the query parameters

  try {
    // Fetch patient details based on email
    const patient = await Patient.findOne({ email });

    // Fetch all prescription details based on bookingId
    const prescriptions = await Prescription.find({ bookingId });

    // Check if patient or prescriptions are not found
    if (!patient || prescriptions.length === 0) {
      return res.status(404).json({ message: "Patient or prescriptions not found" });
    }

    // Prepare the response data, including patient and prescription details
    const prescriptionDetails = {
      patientDetails: {
        name: patient.name,
        number: patient.mobile,
        email: patient.email,
        address: "N/A", // Placeholder for additional patient information
        age: patient.age,
        sex: patient.sex,
        weight: "N/A",  // Placeholder for additional patient information
        bloodPressure: "N/A", // Placeholder for additional patient information
        height: "N/A", // Placeholder for additional patient information
      },
      medicines: prescriptions.flatMap(p => p.medicines),  // Flatten medicines array from all prescriptions
      recommendedTests: prescriptions.flatMap(p => p.recommendedTest || []),  // Flatten recommended tests array
      doctorDetails: {
        doctorName: "Dr. Nishant Kumar",  // Static doctor details (can be dynamic if needed)
        doctorLicense: "TNMC161353",  // Static doctor license number
        degree: "MBBS",  // Static doctor degree
      },
      patientComplaints: prescriptions.flatMap(p => p.patientComplaint.length > 0 ? p.patientComplaint : [{ Complaint: "N/A" }]),  // Default to "N/A" if no complaints are found
      doctorDiagnoses: prescriptions.flatMap(p => p.DoctorDiagnosis.length > 0 ? p.DoctorDiagnosis : [{ Diagnosis: "N/A" }]),  // Default to "N/A" if no diagnoses are found
    };

    // If no complaints are found, set to "N/A"
    if (prescriptionDetails.patientComplaints.length === 0) {
      prescriptionDetails.patientComplaints = [{ Complaint: "N/A" }];
    }

    // If no diagnoses are found, set to "N/A"
    if (prescriptionDetails.doctorDiagnoses.length === 0) {
      prescriptionDetails.doctorDiagnoses = [{ Diagnosis: "N/A" }];
    }

    // Return the prescription details in the response
    return res.json(prescriptionDetails);
  } catch (error) {
    console.error(error);  // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" });  // Return 500 status in case of error
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
  fetchAllPrescriptionDetails,
  patientComplaint,
  getPatientComplaint,
  sendDiagnosis,
  getDiagnosis,
};
