const Payment = require("../models/Payment");
const DateBookings = require("../models/DateBookings"); // Ensure this is imported
const Patient = require("../models/Patient");
const { sendConsultationEmail} = require("../utils/sendGoogleLink");

const upcomingBookings = async (req, res) => {
    try {
        const { patientId } = req.body;

        // If patientId is not provided, fetch all successful payments
        if (!patientId) {
            const payments = await Payment.find({ status: "success" });

            if (payments.length === 0) {
                return res.status(404).json({ message: 'No upcoming bookings found.' });
            }

            const bookingDetails = await Promise.all(payments.map(async (payment) => {
                const bookingId = payment.bookingId;

                // Find the corresponding DateBookings entry for each bookingId
                const dateBooking = await DateBookings.findOne({ "slots.bookingId": bookingId });

                if (!dateBooking) {
                    return null;
                }

                const slot = dateBooking.slots.find(slot => slot.bookingId === bookingId);

                // Find the patient for this payment (assuming payment has patient info linked by email or ID)
                const patient = await Patient.findOne({ email: payment.notes.email });

                return {
                    bookingId,
                    patientId: patient ? patient.patientId : null,
                    slotTime: slot ? slot.time : null,
                    status: slot ? slot.status : null,
                    paymentInfo: payment
                };
            }));

            const validBookingDetails = bookingDetails.filter(detail => detail !== null);

            if (validBookingDetails.length === 0) {
                return res.status(404).json({ message: 'No upcoming bookings found.' });
            }

            return res.status(200).json(validBookingDetails);
        }

        // If patientId is provided, find the patient by ID
        const patient = await Patient.findOne({ patientId });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        const payments = await Payment.find({
            status: "success",
            "notes.email": patient.email
        });

        if (payments.length === 0) {
            return res.status(404).json({ message: 'No upcoming bookings found for this patient.' });
        }

        const bookingDetails = await Promise.all(payments.map(async (payment) => {
            const bookingId = payment.bookingId;
            const dateBooking = await DateBookings.findOne({ "slots.bookingId": bookingId });

            if (!dateBooking) {
                return null;
            }

            const slot = dateBooking.slots.find(slot => slot.bookingId === bookingId);

            return {
                bookingId,
                patientId: patient.patientId,
                slotTime: slot ? slot.time : null,
                status: slot ? slot.status : null,
                paymentInfo: payment
            };
        }));

        const validBookingDetails = bookingDetails.filter(detail => detail !== null);

        if (validBookingDetails.length === 0) {
            return res.status(404).json({ message: 'No upcoming bookings found for this patient.' });
        }

        res.status(200).json(validBookingDetails);

    } catch (error) {
        console.error("Error retrieving bookings:", error);
        res.status(500).json({ message: 'Error retrieving bookings', error });
    }
};





const postGoogleMeet = async (req, res) => {
    const { bookingId, googlemeetlink, patientId, patientName, patientEmail, patientContact } = req.body;

    try {
        // Step 1: Update the Payment document with the provided googlemeetlink
        const result = await Payment.updateOne(
            { bookingId: bookingId },
            { $set: { googleMeet: googlemeetlink } }
        );

        // Step 2: Check if the update was successful
        if (result.nModified === 0) {
            return res.status(404).json({ message: 'Booking not found or no changes made.' });
        }

        // Step 3: Send email to the patient with the Google Meet link
        await sendConsultationEmail(patientEmail, googlemeetlink, patientName);

        // Step 4: Send a success response
        res.status(200).json({ message: 'Google Meet link updated and email sent successfully.' });
    } catch (error) {
        console.error("Error updating Google Meet link:", error);
        res.status(500).json({ message: 'Error updating Google Meet link and sending email', error });
    }
};

module.exports = { upcomingBookings,postGoogleMeet };
