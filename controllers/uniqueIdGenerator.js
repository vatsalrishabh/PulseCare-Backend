const Patient = require('../models/Patient'); // Adjust the path as needed

async function generateUniqueId() {
    try {
        // Get the current date
        const now = new Date();
        const YEAR = now.getFullYear();
        const MONTH = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const DATE = String(now.getDate()).padStart(2, '0');

        // Count the number of documents in the Patient collection
        const patientNumber = await Patient.countDocuments();

        // Generate a unique ID without a hyphen
        const patientId = `${YEAR}${MONTH}${DATE}${patientNumber + 1}`; // Simple unique suffix

        return patientId;
    } catch (error) {
        console.error('Error generating unique ID:', error);
        throw error; // Rethrow the error for further handling if needed
    }
}

// Example usage
generateUniqueId().then((id) => {
    console.log(`Generated Unique Patient ID: ${id}`);
});

// Export the function for use in other modules
module.exports = { generateUniqueId };
