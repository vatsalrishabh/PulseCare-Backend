const Payment = require('../models/Payment');
const DateBookings = require('../models/DateBookings');
const Prescription = require('../models/Prescription');

const getAllBookings = async (req, res) => {
  try {
    // Fetch all payments
    const payments = await Payment.find({});

    // Fetch all date bookings
    const dateBookings = await DateBookings.find({});

    // Create a mapping of payments by bookingId
    const paymentMap = payments.reduce((acc, payment) => {
      acc[payment.bookingId] = payment;
      return acc;
    }, {});

    // Merge data
    const mergedBookings = dateBookings.map((dateBooking) => {
      const slots = dateBooking.slots.map((slot) => {
        const payment = paymentMap[slot.bookingId] || {}; // Get the payment if it exists
        return {
          ...slot,
          paymentDetails: {
            razorOrderId: payment.razorOrderId || null,
            razorPaymentId: payment.razorPaymentId || null,
            amount: payment.amount || null,
            currency: payment.currency || null,
            status: payment.status || 'pending', // Default to 'pending' if no payment exists
          },
        };
      });

      return {
        date: dateBooking.date,
        slots,
      };
    });

    // Send the merged data as a response
    res.status(200).json(mergedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const prescribeMedecine=async(req,res)=>{
  try {
    const prescriptionData = req.body;
    const newPrescription = new Prescription(prescriptionData);
    await newPrescription.save();
    res.status(201).json(newPrescription);
  } catch (error) {
    res.status(400).json({ message: 'Error creating prescription', error });
  }
}

const oldPrescription = async (req, res) => {
  try {
    const { email } = req.body; // Destructure email from the request body
    const result = await Prescription.find({ "patient.email": email }); // Query using the email field

    // Check if any prescriptions were found
    if (result.length === 0) {
      return res.status(404).json({ message: 'No prescriptions found for this email.' });
    }

    res.status(200).json(result); // Send the result back to the client
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving prescriptions', error });
  }
};



module.exports = {
  getAllBookings,
  prescribeMedecine,
  oldPrescription,
};
