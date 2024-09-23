const express = require('express');
const { registerPatient , verifyOtp, loginPatient, updatePassword, updatePasswordOtp } = require('../controllers/authController');
const {getBookings, postBookings} = require('../controllers/datebookings')
const { jwtMiddleware } = require('../middlewares/jwtmiddleware');

const router = express.Router();

// Define patient routes
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



// router.get('/:id', jwtMiddleware,(req, res) => {
//   res.send(`Patient details for ID (${req.params.id})`);
// });

router.put('/:id', (req, res) => {
  res.send(`Update patient with ID ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
  res.send(`Delete patient with ID ${req.params.id}`);
});


// Bookings ROutes









module.exports = router;
