const express = require('express');
const { registerPatient , verifyOtp, loginPatient, updatePassword, updatePasswordOtp } = require('../controllers/authController');
const {getBookings, postBookings,postBookingsAdmin} = require('../controllers/datebookings');
const {postPatientHistory, upcomingBookings } = require('../controllers/patientHistory')
const { jwtMiddleware } = require('../middlewares/jwtmiddleware');
const {getAllBookings,prescribeMedecine,oldPrescription} = require('../controllers/prescriptionController');

const router = express.Router();

// Define patient route
router.get('/', (req, res) => {
  res.send('List of patients');
});

router.post('/register',registerPatient);
router.post('/login',loginPatient);
router.post('/verifyOTP',verifyOtp);
router.post('/updatePassword',updatePassword);
router.post('/updatePasswordOtp',updatePasswordOtp);


router.get('/getBookings',getBookings);  //http://localhost:3000/api/patients/getBookings
router.post('/postBookings',postBookings);  //http://localhost:3000/api/patients/postBookings
router.post('/postBookingsAdmin',postBookingsAdmin);  //http://localhost:3000/api/patients/postBookingsAdmin



router.post('/upcomingBookings',upcomingBookings);  //http://localhost:3000/api/patients/upcomingBookings
router.post('/postHistory',postPatientHistory);  //http://localhost:3000/api/patients/postHistory
router.post('/prescribeMedecine',prescribeMedecine);  //http://localhost:3000/api/patients/prescribeMedecine
router.post('/oldPrescription',oldPrescription);  //http://localhost:3000/api/patients/oldPrescription

// router.get('/:id', jwtMiddleware,(req, res) => {
//   res.send(`Patient details for ID (${req.params.id})`);
// });




// Prescription ROutes
router.get('/getAllBookings',getAllBookings); //http://localhost:3000/api/patients/getAllBookings









module.exports = router;
