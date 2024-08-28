const express = require('express');
const {
  registerDoctor,
  verifyOtp,
  loginDoctor,
  updatePassword,
  updatePasswordOtp
} = require('../controllers/authDController');
const router = express.Router();



// controllers
router.post('/register',registerDoctor);
router.post('/login',loginDoctor);
router.post('/verifyOTP',verifyOtp);
router.post('/updatePassword',updatePassword);
router.post('/updatePasswordOtp',updatePasswordOtp);



// Define doctor routes
router.get('/', (req, res) => {
  res.send('List of doctors');
});

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
