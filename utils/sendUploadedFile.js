const nodemailer = require('nodemailer');
const path = require('path');

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.PulseCareEmail, // Your PulseCare email address
    pass: process.env.EmailPassword, // Your email password
  },
});

// Function to send an email with file attached
const sendFileDetailsEmailWithAttachment = (to, subject, fileDetails, filePath) => {
  const mailOptions = {
    from: process.env.PulseCareEmail,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Patient File Uploaded</h2>
        <p>Dear Doctor,</p>
        <p>A new file has been uploaded. Here are the details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${fileDetails.bookingId}</li>
          <li><strong>Document Type:</strong> ${fileDetails.documentType}</li>
          <li><strong>Patient ID:</strong> ${fileDetails.patientId}</li>
        </ul>
        <p>The file is attached to this email for your reference.</p>
        <p style="color: #777;">Best regards,<br/>The PulseCare Team</p>
      </div>
    `,
    attachments: [
      {
        filename: path.basename(filePath), // File name from the path
        path: filePath, // Full path to the file
      },
    ],
  };

  // Send the email
  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Email sending failed');
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = {
  sendFileDetailsEmailWithAttachment,
};
