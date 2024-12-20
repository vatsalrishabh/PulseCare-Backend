const express = require('express');
const { registerPatient , verifyOtp, loginPatient, updatePassword, updatePasswordOtp } = require('../controllers/authController');
const {getBookings, postBookings,postBookingsAdmin, postMultipleBookingsAdmin} = require('../controllers/datebookings');
const {postPatientHistory, getPatientHistory,upcomingBookings,getAllPatients } = require('../controllers/patientHistory')
const { jwtMiddleware } = require('../middlewares/jwtmiddleware');
const {getAllBookings,prescribeMedecine,oldPrescription,PatientOldPrescription, viewRecommendedTest,recommendTest, deleteTest, getPatientId, fetchAllPrescriptionDetails,patientComplaint,getPatientComplaint,sendDiagnosis, getDiagnosis} = require('../controllers/prescriptionController');
const {patientFileUpload,viewUploadedFiles} = require('../controllers/patientUploadFile');
const { sendMailToCx } = require('../controllers/mailsControllers');
const router = express.Router();

// Define patient route
router.get('/getAllPatients', getAllPatients); //http://localhost:3000/api/patients/getAllPatients
router.get('/getPatientId',getPatientId); //http://localhost:3000/api/patients/getPatientId

router.post('/register',registerPatient);
router.post('/login',loginPatient);
router.post('/verifyOTP',verifyOtp);
router.post('/updatePassword',updatePassword);
router.post('/updatePasswordOtp',updatePasswordOtp);


router.get('/getBookings',getBookings);  //http://localhost:3000/api/patients/getBookings
router.post('/postBookings',postBookings);  //http://localhost:3000/api/patients/postBookings
router.post('/postBookingsAdmin',postBookingsAdmin);  //http://localhost:3000/api/patients/postBookingsAdmin
router.put('/postMultipleBookingsAdmin',postMultipleBookingsAdmin);  //http://localhost:3000/api/patients/postMultipleBookingsAdmin


router.get('/viewRecommendedTest',viewRecommendedTest);  //http://localhost:3000/api/patients/viewRecommendedTest
router.post('/recommendTest',recommendTest);  //http://localhost:3000/api/patients/recommendTest
router.delete('/deleteTest', deleteTest);  //http://localhost:3000/api/patients/deleteTest



router.post('/upcomingBookings',upcomingBookings);  //http://localhost:3000/api/patients/upcomingBookings
router.post('/postHistory',postPatientHistory);  //http://localhost:3000/api/patients/postHistory
router.get('/getPatientHistory/:email',getPatientHistory);  //http://localhost:3000/api/patients/getPatientHistory:
router.post('/prescribeMedecine',prescribeMedecine);  //http://localhost:3000/api/patients/prescribeMedecine
router.post('/oldPrescription',oldPrescription);  //http://localhost:3000/api/patients/oldPrescription
router.post('/PatientOldPrescription',PatientOldPrescription);  //http://localhost:3000/api/patients/PatientOldPrescription
router.get('/fetchAllPrescriptionDetails',fetchAllPrescriptionDetails);  //http://localhost:3000/api/patients/fetchAllPrescriptionDetails
router.post('/patientComplaint',patientComplaint);  //http://localhost:3000/api/patients/patientComplaint
router.get('/getPatientComplaint',getPatientComplaint);  //http://localhost:3000/api/patients/getPatientComplaint
router.post('/sendDiagnosis',sendDiagnosis);  //http://localhost:3000/api/patients/sendDiagnosis
router.get('/getDiagnosis',getDiagnosis);  //http://localhost:3000/api/patients/getDiagnosis



// router.get('/:id', jwtMiddleware,(req, res) => {
//   res.send(`Patient details for ID (${req.params.id})`);
// });

router.post('/patientFileUpload',patientFileUpload);  //http://localhost:3000/api/patients/patientFileUpload
router.get('/viewUploadedFiles',viewUploadedFiles);  //http://localhost:3000/api/patients/viewUploadedFiles



// Prescription ROutes
router.get('/getAllBookings',getAllBookings); //http://localhost:3000/api/patients/getAllBookings

router.post('/sendMailToCx',sendMailToCx); //http://localhost:3000/api/patients/sendMailToCx









module.exports = router;
