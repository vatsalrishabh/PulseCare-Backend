const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
}, { _id: false }); // Disable _id for subdocuments

const PrescriptionSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  patient: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
  },
  paymentStatus: { type: String, required: true }, // e.g., "Paid", "Pending"
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  medicines: [MedicineSchema], // Array of medicine objects
}, {
  timestamps: true, // Automatically create createdAt and updatedAt fields
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);

module.exports = Prescription;
