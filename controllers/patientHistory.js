const PatientHistory = require('../models/PatientHistory'); // Adjust path as necessary

const postPatientHistory = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a patient history entry with the provided email already exists
    let existingHistory = await PatientHistory.findOne({ email });

    if (existingHistory) {
      // If it exists, update the existing history with the new data
      existingHistory.allergies = { ...existingHistory.allergies, ...req.body.allergies };
      existingHistory.surgicalHistory = { ...existingHistory.surgicalHistory, ...req.body.surgicalHistory };
      existingHistory.medicalHistory = { ...existingHistory.medicalHistory, ...req.body.medicalHistory };
      existingHistory.ongoingConditions = { ...existingHistory.ongoingConditions, ...req.body.ongoingConditions };
      existingHistory.currentMedications = { ...existingHistory.currentMedications, ...req.body.currentMedications };
      existingHistory.familyHistory = { ...existingHistory.familyHistory, ...req.body.familyHistory };
      existingHistory.lifestyle = { ...existingHistory.lifestyle, ...req.body.lifestyle };
      existingHistory.mentalHealth = { ...existingHistory.mentalHealth, ...req.body.mentalHealth };
      existingHistory.immunization = { ...existingHistory.immunization, ...req.body.immunization };
      existingHistory.screenings = { ...existingHistory.screenings, ...req.body.screenings };
      existingHistory.additionalInfo = req.body.additionalInfo || existingHistory.additionalInfo; // Update additionalInfo if provided

      // Save the updated history
      await existingHistory.save();
      return res.status(200).json(existingHistory);
    } else {
      // If it does not exist, create a new entry
      const newPatientHistory = new PatientHistory(req.body);
      await newPatientHistory.save();
      return res.status(201).json(newPatientHistory);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { postPatientHistory };
