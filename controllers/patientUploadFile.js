const fs = require('fs');
const path = require('path');
const multer = require('multer');
const PatientFile = require('../models/PatientFile'); 
const { sendFileDetailsEmailWithAttachment } = require('../utils/sendUploadedFile');

// Create upload folder if it doesn't exist
const createUploadFolder = (patientId) => {
  const uploadDir = path.join(__dirname, `../uploads/${patientId}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { patientId } = req.body; // Access patientId here
    console.log('Patient ID:', patientId); // Log the patient ID
    const uploadDir = createUploadFolder(patientId);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { bookingId, documentType, patientId } = req.body; // Access patientId here
    const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const newFileName = `${bookingId}-${currentDate}-${documentType}-${patientId}${path.extname(file.originalname)}`;
    console.log('New File Name:', newFileName); // Log the new file name
    cb(null, newFileName);
  },
});

// Initialize multer
const upload = multer({ storage });

// Middleware to handle file uploads
const patientFileUpload = async (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ message: 'Error uploading the file', error: err });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const { bookingId, documentType, patientId } = req.body; // Include doctorEmail
      console.log('Booking ID:', bookingId);
      console.log('Document Type:', documentType);
      console.log('Patient ID:', patientId);

      const fileLink = `/uploads/${patientId}/${req.file.filename}`;
      const filePath = req.file.path; // Full file path for attaching to email

      // Save the file details to the database
      const patientFile = new PatientFile({
        bookingId,
        documentType,
        patientId,
        fileLink,
      });

      await patientFile.save();

      // Prepare file details for the email
      const fileDetails = {
        bookingId,
        documentType,
        patientId,
      };

      // Send the file and details to the doctor via email
      await sendFileDetailsEmailWithAttachment(
        "pulsecare39@gmail.com",
        'New Patient File Uploaded',
        fileDetails,
        filePath
      );

      res.status(200).json({
        message: 'File uploaded and emailed successfully',
        fileName: req.file.filename,
      });
    } catch (error) {
      console.error('Error processing file upload:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};


const viewUploadedFiles = async (req, res) => {
  try {
    const serverBaseURL = `${req.protocol}://${req.get('host')}`; // Dynamically construct the base URL
    const files = await PatientFile.find(); // Fetch all uploaded files
    
    // Append the server's base URL to each fileLink
    const updatedFiles = files.map((file) => ({
      ...file._doc, // Spread the document properties
      fileLink: `${serverBaseURL}${file.fileLink}`, // Update the fileLink dynamically
    }));

    // Send the updated files as the response
    res.status(200).json(updatedFiles);
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = { patientFileUpload, viewUploadedFiles };


