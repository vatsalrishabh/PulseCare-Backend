const mongoose = require('mongoose');

const PatientFileSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  fileLink: {
    type: String,
    required: true, // This will store the path to the file.
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const PatientFile = mongoose.model('PatientFile', PatientFileSchema);

module.exports = PatientFile;
