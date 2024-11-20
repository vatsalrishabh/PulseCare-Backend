// mailerController.js
const nodemailer = require('nodemailer');

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services if needed
    auth: {
        user: process.env.PulseCareEmail, // Your PulseCare email address
        pass: process.env.EmailPassword   // Your email password (preferably stored securely in environment variables)
    }
});

// Function to send email notification to the patient
const sendConsultationEmail = (to, googleMeetLink, patientName) => {
    const mailOptions = {
        from: process.env.PulseCareEmail, // Sender email address
        to, // Recipient email address
        subject: 'Your Online Consultation Link',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">PulseCare Online Consultation</h2>
                <p>Dear ${patientName},</p>
                <p>Your doctor has uploaded the Google Meet link for your upcoming online consultation. Please use the link below to join the meeting:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${googleMeetLink}" target="_blank" style="font-size: 18px; color: #4CAF50; font-weight: bold;">Join Your Consultation</a>
                </div>
                <p>If you have any issues or need assistance, please feel free to contact us.</p>
                <p style="color: #777;">Best regards,<br/>The PulseCare Team</p>
            </div>
        `
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
    sendConsultationEmail
};
