const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: String,
  password: String,
  age: Number,
  sex: String,
  license:String,
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
