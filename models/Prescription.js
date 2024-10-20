const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  bookingId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  medicines: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      prescriptionFile: { type: String}  // Path to the prescription file
    }
  ]
});

// Exporting the Prescription model
module.exports = mongoose.model('Prescription', prescriptionSchema);
