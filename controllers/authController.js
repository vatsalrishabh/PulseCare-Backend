const { sendOtpEmail } = require('../utils/mailer');
const { sendOtpEmailForgot } = require('../utils/forgotOtpmail');
const Patient = require('../models/Patient');
const Otp = require('../models/Otp');

const message = "To ensure the security of your account and to complete your registration, please verify your email with the One-Time Password (OTP) provided below.";
const subject = "Your OTP for PulseCare.";

// Function to generate a 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Register Patient
const registerPatient = async (req, res) => {
    const { name, email, mobile, password, age, sex } = req.body;

    try {
        const existingUser = await Patient.findOne({ email });
        if (existingUser) {
            console.log("User is already registered.");
            return res.status(400).json({ message: 'User already registered. Please try logging in.' });
        }

        let otpDoc = await Otp.findOne({ email });
        const otp = otpDoc ? otpDoc.otp : generateOtp();

        if (!otpDoc) {
            otpDoc = new Otp({ email, otp });
            await otpDoc.save(); // Save the OTP to the database
            console.log("New OTP generated and sent.");
        } else {
            console.log("OTP from Otp collection: " + otpDoc.otp);
        }

        await sendOtpEmail(email, otp, message, subject);

        return res.status(200).json({ message: 'Registration successful, OTP sent to email.' });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const existingOtp = await Otp.findOne({ email, otp });
        if (existingOtp) {
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

// Login Patient
const loginPatient = async (req, res) => {
    const { patientEmail, patientPassword } = req.body;
  
    try {
        const email = patientEmail;
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ message: 'User not found.' });
        }
  
        if (patient.password !== patientPassword) {
            return res.status(400).json({ message: 'Incorrect password.' });
        }
  
        return res.status(200).json({ message: 'User Logged In Successfully.', patientDetails: patient });
    } catch (error) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Update Password
const updatePassword = async (req, res) => {
    const { emailUpdatePassword } = req.body;
    const email = emailUpdatePassword;

    try {
        const patientDetails = await Patient.findOne({ email });
        if (!patientDetails) {
            return res.status(400).json({ message: "Email not found, Please go to Registration Page!" });
        }

        const otpDoc = await Otp.findOne({ email });
        const otp = otpDoc ? otpDoc.otp : generateOtp();

        if (!otpDoc) {
            const newOtp = new Otp({ email, otp });
            await newOtp.save();
            await sendOtpEmailForgot(email, otp, "OTP to reset your password.", subject);
            console.log("New OTP generated and sent for password reset.");
        } else {
            await sendOtpEmailForgot(email, otp, "OTP to reset your password.", subject);
            console.log("Existing OTP sent for password reset.");
        }

        return res.status(200).json({ message: "OTP to change password has been sent." });
    } catch (error) {
        console.error('Error during password update request:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Verify OTP and Update Password
const updatePasswordOtp = async (req, res) => {
    const { email, password, otp } = req.body;

    try {
        const otpMatched = await Otp.findOne({ email, otp });
        if (!otpMatched) {
            return res.status(400).json({ message: "OTP did not match. Please try again." });
        }

        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(400).json({ message: "Patient not found. Please register first." });
        }

        // Update the patient's password
        patient.password = password;
        await patient.save();

        // Delete the used OTP
        await Otp.deleteOne({ email });

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error('Error during OTP verification for password update:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    registerPatient,
    verifyOtp,
    loginPatient,
    updatePassword,
    updatePasswordOtp
};
