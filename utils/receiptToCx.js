const nodemailer = require('nodemailer');

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email services if needed
  auth: {
    user: process.env.PulseCareEmail, // Your PulseCare email address
    pass: process.env.EmailPassword,  // Your email password (preferably stored securely in environment variables)
  },
});

// Function to send receipt email
const sendReceiptToCx = async (to, patientDetails) => {
  const { patientId, name, appointmentDate, appointmentTime, doctorName, diseaseType, amount, bookingId, email } = patientDetails;

  const mailOptions = {
    from: process.env.PulseCareEmail, // Sender email address
    to, 
    subject: 'PulseCare Appointment Receipt', // Email subject
    text: `Dear ${name},\n\nHere is your appointment receipt:\n\nPatient ID: ${patientId}\nBooking ID: ${bookingId}\nDoctor: ${doctorName}\nDisease: ${diseaseType}\nAppointment Date: ${appointmentDate}\nAppointment Time: ${appointmentTime}\nAmount: ₹${amount}\nEmail: ${email}\n\nThank you for choosing PulseCare!`,
    html: `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            width: 100%;
            max-width: 650px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            color: #4CAF50;
            font-size: 26px;
            margin-bottom: 20px;
          }
          .receipt-details {
            margin-top: 30px;
            font-size: 16px;
            color: #333;
          }
          .receipt-details ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .receipt-details li {
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
          }
          .receipt-details li:last-child {
            border-bottom: none;
          }
          .total-amount {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #777;
            margin-top: 30px;
          }
          .footer a {
            color: #4CAF50;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>PulseCare Appointment Receipt</h2>
          </div>
          <div class="receipt-details">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for booking an appointment with PulseCare. Below are your appointment details:</p>
            <ul>
              <li><strong>Patient ID:</strong> ${patientId}</li>
              <li><strong>Booking ID:</strong> ${bookingId}</li>
              <li><strong>Doctor:</strong> ${doctorName}</li>
              <li><strong>Disease Type:</strong> ${diseaseType}</li>
              <li><strong>Appointment Date:</strong> ${appointmentDate}</li>
              <li><strong>Appointment Time:</strong> ${appointmentTime}</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
            <p class="total-amount">Total Amount: ₹${amount}</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing PulseCare!</p>
            <p>Best regards,<br />The PulseCare Team</p>
            <p>For more details, visit our <a href="https://www.pulsecare.netlify.app" target="_blank">website</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    // Send the email using async/await
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info; // Return info for further use if needed
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email'); // Throwing the error to be caught at a higher level
  }
};


const sendReceiptToDoc = async (doctorEmail, patientDetails) => {
    const { patientId, name, appointmentDate, appointmentTime, doctorName, diseaseType, amount, bookingId, email } = patientDetails;
  
    const mailOptions = {
      from: process.env.PulseCareEmail, // Sender email address
      doctorEmail, 
      subject: 'PulseCare Appointment Receipt', // Email subject
      text: `Dear ${doctorName},\n\nHere is your appointment receipt:\n\nPatient ID: ${patientId}\nBooking ID: ${bookingId}\nPatient: ${name}\nDisease: ${diseaseType}\nAppointment Date: ${appointmentDate}\nAppointment Time: ${appointmentTime}\nAmount: ₹${amount}\nEmail: ${email}\n\nThank you for choosing PulseCare!`,
      html: `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              width: 100%;
              max-width: 650px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              color: #4CAF50;
              font-size: 26px;
              margin-bottom: 20px;
            }
            .receipt-details {
              margin-top: 30px;
              font-size: 16px;
              color: #333;
            }
            .receipt-details ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .receipt-details li {
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .receipt-details li:last-child {
              border-bottom: none;
            }
            .total-amount {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #777;
              margin-top: 30px;
            }
            .footer a {
              color: #4CAF50;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>PulseCare Appointment Receipt</h2>
            </div>
            <div class="receipt-details">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for booking an appointment with PulseCare. Below are your appointment details:</p>
              <ul>
                <li><strong>Patient ID:</strong> ${patientId}</li>
                <li><strong>Booking ID:</strong> ${bookingId}</li>
                <li><strong>Doctor:</strong> ${doctorName}</li>
                <li><strong>Disease Type:</strong> ${diseaseType}</li>
                <li><strong>Appointment Date:</strong> ${appointmentDate}</li>
                <li><strong>Appointment Time:</strong> ${appointmentTime}</li>
                <li><strong>Email:</strong> ${email}</li>
              </ul>
              <p class="total-amount">Total Amount: ₹${amount}</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing PulseCare!</p>
              <p>Best regards,<br />The PulseCare Team</p>
              <p>For more details, visit our <a href="https://www.pulsecare.netlify.app" target="_blank">website</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  
    try {
      // Send the email using async/await
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return info; // Return info for further use if needed
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email'); // Throwing the error to be caught at a higher level
    }
  };

module.exports = {
  sendReceiptToCx,
  sendReceiptToDoc,
};
