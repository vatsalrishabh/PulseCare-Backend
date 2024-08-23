const { sendOtpEmail } = require('../utils/mailer');
const Patient = require('../models/Patient');
const Otp = require('../models/Otp');

const message = "To ensure the security of your account and to complete your registration, please verify your email with the One-Time Password (OTP) provided below.";
const subject = "Your OTP for PulseCare Registration";

// Function to generate a 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
}


// below is the code to register the user 

const registerPatient = async (req, res) => {
    const { name, email, mobile, password, age, sex } = req.body;

    try {
        const existingUser = await Patient.findOne({ email });
        if (existingUser) {
            console.log("User is already registered.");
            return res.status(400).json({ message: 'User already registered. Please try logging in.' });
        }

        let otpDoc = await Otp.findOne({ email });
        if (otpDoc) {
            // If OTP exists, send the existing OTP
            console.log("OTP from Otp collection: " + otpDoc.otp);
            await sendOtpEmail(email, otpDoc.otp, message, subject);
        } else {
            // Generate and save a new OTP
            const otp = generateOtp();
            otpDoc = new Otp({ email, otp });
            await otpDoc.save(); // Save the OTP to the database
            await sendOtpEmail(email, otp, message, subject);
            console.log("New OTP generated and sent.");
        }

        return res.status(200).json({ message: 'Registration successful, OTP sent to email.' });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// below is the code to verify the otp

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check if OTP matches
        const existingOtp = await Otp.findOne({ email, otp });
        if (existingOtp) {
            // If OTP matches, save the patient information
            const { name, mobile, password, age, sex } = req.body;
            const newPatient = new Patient({ name, email, mobile, password, age, sex });
            await newPatient.save();

            // Optionally, delete the OTP after successful verification
            await Otp.deleteOne({ email });

            return res.status(200).json({ message: 'You have been successfully registered.' });
        } else {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// below is the code to login
const loginPatient = async (req, res) => {
    const { patientEmail, patientPassword } = req.body;
  
    try {
      // Find the patient by email
      const email = patientEmail
      const patient = await Patient.findOne({ email});
      if (!patient) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Check if the password matches
      if (patient.password !== patientPassword) {
        return res.status(400).json({ message: 'Incorrect password.' });
      }
  
      return res.status(200).json({ message: 'User Logged In Successfully.', patientDetails: patient });
    } catch (error) {
      return res.status(500).json({ message: 'Server error.' });
    }
  };
  

module.exports = {
    registerPatient,
    verifyOtp,
    loginPatient
};
