const fs = require('fs');
const path = require('path');
const multer = require('multer');
const PatientFile = require('../models/PatientFile'); 

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
  console.log('Request Body:', req.body); // Log the entire request body
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Upload Error:', err); // Log any upload errors
      return res.status(500).json({ message: 'Error uploading the file', error: err });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const { bookingId, documentType, patientId } = req.body;
      console.log('Booking ID:', bookingId); // Log the booking ID
      console.log('Document Type:', documentType); // Log the document type
      console.log('Patient ID:', patientId); // Log the patient ID

      const fileLink = `/uploads/${patientId}/${req.file.filename}`; // Path to the uploaded file

      // Save the file details to the database
      const patientFile = new PatientFile({
        bookingId,
        documentType,
        patientId,
        fileLink,
      });

      await patientFile.save(); // Save the file information in the database

      res.status(200).json({
        message: 'File uploaded and saved successfully',
        fileName: req.file.filename,
        fileLink,
      });
    } catch (error) {
      console.error('Error saving file information:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};


const viewUploadedFiles = async (req, res) => {
  try {
    const files = await PatientFile.find(); // Fetch all uploaded files
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { patientFileUpload, viewUploadedFiles };


