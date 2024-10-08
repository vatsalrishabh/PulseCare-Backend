const { sendOtpEmail } = require('../utils/mailer');
const { sendOtpEmailForgot } = require('../utils/forgotOtpmail');
const Doctor = require('../models/Doctor');
const Otp = require('../models/Otp');

const message = "To ensure the security of your account and to complete your registration, please verify your email with the One-Time Password (OTP) provided below.";
const subject = "Your OTP for PulseCare.";

// Function to generate a 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Register Doctor
const registerDoctor = async (req, res) => {
    const { name, email, mobile, password, age, sex, license } = req.body;
    console.log(req.body);

    try {
        const existingUser = await Doctor.findOne({ email });
        if (existingUser) {
            console.log("Doctor is already registered.");
            return res.status(400).json({ message: 'Doctor already registered. Please try logging in.' });
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
    console.log(req.body);

    try {
        const existingOtp = await Otp.findOne({ email, otp });
        if (existingOtp) {
            const { name, mobile, password, age, sex , license,email} = req.body;
            const newDoctor = new Doctor({ name, email, mobile, password, age, sex, license });
            await newDoctor.save();

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

// Login Doctor
const loginDoctor = async (req, res) => {
    const { doctorEmail, doctorPassword } = req.body;
    // console.log(req.body);
  
    try {
        const email = doctorEmail;
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ message: 'User not found.' });
        }
  
        if (doctor.password !== doctorPassword) {
            return res.status(400).json({ message: 'Incorrect password.' });
        }
//   console.log(doctor);
        return res.status(200).json({ message: 'User Logged In Successfully.',  DoctorDetails: { 
            name: doctor.name,
            email: doctor.email,
            mobile: doctor.mobile,
            age: doctor.age,
            sex: doctor.sex,
            license: doctor.license 
        }});
    } catch (error) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Update Password
const updatePassword = async (req, res) => {
    const { emailUpdatePassword } = req.body;
    console.log(req.body);
    const email = emailUpdatePassword;

    try {
        const DoctorDetails = await Doctor.findOne({ email });
        if (!DoctorDetails) {
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

        const Doctor = await Doctor.findOne({ email });
        if (!Doctor) {
            return res.status(400).json({ message: "Doctor not found. Please register first." });
        }

        // Update the Doctor's password
        Doctor.password = password;
        await Doctor.save();

        // Delete the used OTP
        await Otp.deleteOne({ email });

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error('Error during OTP verification for password update:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};


const getAllDoctors = async (req, res) => {
    try {
      const doctors = await Doctor.find({}, 'name email'); // Fetch only name and email
      res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching doctors' });
    }
  };

module.exports = {
    getAllDoctors,
    registerDoctor,
    verifyOtp,
    loginDoctor,
    updatePassword,
    updatePasswordOtp
};
