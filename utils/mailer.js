const nodemailer = require('nodemailer');

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services if needed
    auth: {
        user: process.env.PulseCareEmail, // Your PulseCare email address
        pass: process.env.EmailPassword   // Your email password (preferably stored securely in environment variables)
    }
});

// Function to send OTP email
const sendOtpEmail = (to, otp, subject) => {
    const mailOptions = {
        from: process.env.PulseCareEmail, // Sender email address
        to, // Recipient email address
        subject: subject, // Email subject
        text: `${subject}: ${otp}. This step will allow you to access our online doctor consultancy services and take charge of your health.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Welcome to PulseCare!</h2>
                <p>Dear User,</p>
                <p>To ensure the security of your account and to complete your registration, please verify your email with the One-Time Password (OTP) provided below.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; color: #4CAF50; font-weight: bold;">Your OTP: ${otp}</span>
                </div>
                <p>Please enter the OTP above to complete your registration.</p>
                <p>This step will allow you to access our online doctor consultancy services and take charge of your health.</p>
                <p style="text-align: center; margin: 20px 0;">
                    <img src="https://t4.ftcdn.net/jpg/03/33/90/67/360_F_333906704_JFXLTAImnaXTxpNJZYOmMQL2hx80zTG8.jpg" alt="PulseCare" style="width: 100%; max-width: 400px; border-radius: 10px;" />
                </p>
                <p>Thank you for choosing PulseCare. We are here to support your health journey.</p>
                <p style="color: #777;">Best regards,<br/>The PulseCare Team</p>
            </div>
        `,
    };

    // Send the email
    return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = {
    sendOtpEmail
};
