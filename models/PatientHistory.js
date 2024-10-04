const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema({
  medications: { type: String, default: 'None' },
  food: { type: String, default: 'None' },
  environmental: { type: String, default: 'None' },
});

const surgicalHistorySchema = new mongoose.Schema({
  surgeries: { type: String, default: 'None' },
  complications: { type: String, default: 'None' },
});

const medicalHistorySchema = new mongoose.Schema({
  chronicConditions: { type: String, default: 'None' },
  pastIllnesses: { type: String, default: 'None' },
  hospitalizations: { type: String, default: 'None' },
});

const ongoingConditionsSchema = new mongoose.Schema({
  currentDiagnoses: { type: String, default: 'None' },
  duration: { type: String, default: 'N/A' },
  symptoms: { type: String, default: 'None' },
});

const currentMedicationsSchema = new mongoose.Schema({
  regular: { type: String, default: 'None' },
  overTheCounter: { type: String, default: 'None' },
  supplements: { type: String, default: 'None' },
});

const familyHistorySchema = new mongoose.Schema({
  parents: { type: String, default: 'None' },
  siblings: { type: String, default: 'None' },
  grandparents: { type: String, default: 'None' },
  geneticDisorders: { type: String, default: 'None' },
});

const lifestyleSchema = new mongoose.Schema({
  smokingStatus: { type: String, default: 'N/A' },
  alcoholConsumption: { type: String, default: 'N/A' },
  exerciseHabits: { type: String, default: 'N/A' },
  diet: { type: String, default: 'N/A' },
});

const mentalHealthSchema = new mongoose.Schema({
  conditions: { type: String, default: 'None' },
  therapies: { type: String, default: 'None' },
  medication: { type: String, default: 'None' },
});

const immunizationSchema = new mongoose.Schema({
  vaccines: { type: String, default: 'None' },
  lastTetanusBooster: { type: String, default: 'N/A' },
});

const screeningsSchema = new mongoose.Schema({
  lastPhysicalExam: { type: String, default: 'N/A' },
  lastBloodWork: { type: String, default: 'N/A' },
  cancerScreenings: { type: String, default: 'N/A' },
});

const patientHistorySchema = new mongoose.Schema({
  email: { type: String, required: true }, // Ensure email is included in the schema
  allergies: allergySchema,
  surgicalHistory: surgicalHistorySchema,
  medicalHistory: medicalHistorySchema,
  ongoingConditions: ongoingConditionsSchema,
  currentMedications: currentMedicationsSchema,
  familyHistory: familyHistorySchema,
  lifestyle: lifestyleSchema,
  mentalHealth: mentalHealthSchema,
  immunization: immunizationSchema,
  screenings: screeningsSchema,
  additionalInfo: { type: String, default: 'None' },
}, { timestamps: true });

const PatientHistory = mongoose.model('PatientHistory', patientHistorySchema);

module.exports = PatientHistory;
