const { sendReceiptToCx, sendReceiptToDoc } = require('../utils/receiptToCx'); // Ensure correct import

const sendMailToCx = async (req, res) => {
  try {
    // Destructure data from req.body
    const { patientId, name, appointmentDate, appointmentTime, doctorName, diseaseType, amount, bookingId, email } = req.body;

    // Prepare patient details for email
    const patientDetails = {
      patientId,
      name,
      appointmentDate,
      appointmentTime,
      doctorName,
      diseaseType,
      amount,
      bookingId,
      email, // Ensure email is part of the patientDetails object
    };
    const doctorId = doctorName.split('(')[1].split(')')[0];

// Add '@gmail.com'
const doctorEmail = doctorId + '@gmail.com';
    // Send receipt email using the email in patientDetails
    await sendReceiptToCx(patientDetails.email, patientDetails);
    await sendReceiptToDoc(doctorEmail , patientDetails)

    return res.status(200).json({ message: 'Receipt sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send receipt. Please try again later.' });
  }
};

module.exports = {
  sendMailToCx,
};
