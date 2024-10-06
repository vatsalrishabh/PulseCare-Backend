const mongoose = require('mongoose');

// Define the Allergy Schema
const allergySchema = new mongoose.Schema({
  medications: { type: String, default: 'None' },
  food: { type: String, default: 'None' },
  environmental: { type: String, default: 'None' },
});

// Define the Surgical History Schema
const surgicalHistorySchema = new mongoose.Schema({
  surgeries: { type: String, default: 'None' },
  complications: { type: String, default: 'None' },
});

// Define the Medical History Schema
const medicalHistorySchema = new mongoose.Schema({
  chronicConditions: { type: String, default: 'None' },
  pastIllnesses: { type: String, default: 'None' },
  hospitalizations: { type: String, default: 'None' },
});

// Define the Ongoing Conditions Schema
const ongoingConditionsSchema = new mongoose.Schema({
  currentDiagnoses: { type: String, default: 'None' },
  duration: { type: String, default: 'N/A' },
  symptoms: { type: String, default: 'None' },
}, { _id: false }); // Prevents creation of a new ID for each sub-document

// Define the Current Medications Schema
const currentMedicationsSchema = new mongoose.Schema({
  regular: { type: String, default: 'None' },
  overTheCounter: { type: String, default: 'None' },
  supplements: { type: String, default: 'None' },
});

// Define the Family History Schema
const familyHistorySchema = new mongoose.Schema({
  parents: { type: String, default: 'None' },
  siblings: { type: String, default: 'None' },
  grandparents: { type: String, default: 'None' },
  geneticDisorders: { type: String, default: 'None' },
});

// Define the Lifestyle Schema
const lifestyleSchema = new mongoose.Schema({
  smokingStatus: { type: String, default: 'N/A' },
  alcoholConsumption: { type: String, default: 'N/A' },
  exerciseHabits: { type: String, default: 'N/A' },
  diet: { type: String, default: 'N/A' },
});

// Define the Mental Health Schema
const mentalHealthSchema = new mongoose.Schema({
  conditions: { type: String, default: 'None' },
  therapies: { type: String, default: 'None' },
  medication: { type: String, default: 'None' },
});

// Define the Immunization Schema
const immunizationSchema = new mongoose.Schema({
  vaccines: { type: String, default: 'None' },
  lastTetanusBooster: { type: String, default: 'N/A' },
});

// Define the Screenings Schema
const screeningsSchema = new mongoose.Schema({
  lastPhysicalExam: { type: String, default: 'N/A' },
  lastBloodWork: { type: String, default: 'N/A' },
  cancerScreenings: { type: String, default: 'N/A' },
});

// Define the Patient History Schema
const patientHistorySchema = new mongoose.Schema({
  email: { type: String, required: true }, // Ensure email is included in the schema
  allergies: allergySchema,
  surgicalHistory: surgicalHistorySchema,
  medicalHistory: medicalHistorySchema,
  ongoingConditions: [ongoingConditionsSchema], // Change to an array of ongoing conditions
  currentMedications: currentMedicationsSchema,
  familyHistory: familyHistorySchema,
  lifestyle: lifestyleSchema,
  mentalHealth: mentalHealthSchema,
  immunization: immunizationSchema,
  screenings: screeningsSchema,
  additionalInfo: { type: String, default: 'None' },
}, { timestamps: true });

// Create the Patient History Model
const PatientHistory = mongoose.model('PatientHistory', patientHistorySchema);

// Export the Patient History Model
module.exports = PatientHistory;
