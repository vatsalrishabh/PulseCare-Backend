const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  verifyOtp,
  loginDoctor,
  updatePassword,
  updatePasswordOtp,
  getAllDoctors
} = require('../controllers/authDController');




// controllers
router.post('/register',registerDoctor);
router.post('/login',loginDoctor);
router.post('/verifyOTP',verifyOtp);
router.post('/updatePassword',updatePassword);
router.post('/updatePasswordOtp',updatePasswordOtp);



// Define doctor routes
router.get('/getAllDoctors', getAllDoctors); //api/doctors/getAllDoctors

router.post('/', (req, res) => {
  res.send('Add a new doctor');
});

router.get('/:id', (req, res) => {
  res.send(`Doctor details for ID ${req.params.id}`);
});

router.put('/:id', (req, res) => {
  res.send(`Update doctor with ID ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
  res.send(`Delete doctor with ID ${req.params.id}`);
});

module.exports = router;
