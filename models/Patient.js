const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId:String,
  name: String,
  email: { type: String, unique: true },
  mobile: String,
  password: String,
  age: Number,
  sex: String,
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
