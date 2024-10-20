const Payment = require("../models/Payment");
const DateBookings = require("../models/DateBookings"); // Ensure this is imported

const upcomingBookings = async (req, res) => {
  
    try {
        const { email } = req.body;
        

        // Step 1: Find payments with status "success"
        const payments = await Payment.find({ status: "success" });

        // Check if any payments were found
        if (payments.length === 0) {
            return res.status(404).json({ message: 'No upcoming bookings found.' });
        }

        // Step 2: Create an array to hold the booking details
        const bookingDetails = await Promise.all(payments.map(async (payment) => {
            const bookingId = payment.bookingId;

            // Step 3: Find the corresponding DateBookings entry for each bookingId
            const dateBooking = await DateBookings.findOne({ "slots.bookingId": bookingId });

            // If no corresponding date booking is found, skip this payment
            if (!dateBooking) {
                return null; // Skip this payment
            }

            // Find the specific slot related to the bookingId
            const slot = dateBooking.slots.find(slot => slot.bookingId === bookingId);

            // Return the combined details
            return {
                bookingId,
                slotTime: slot ? slot.time : null,
                status: slot ? slot.status : null,
                paymentInfo: payment // Include any additional payment information if needed
            };
        }));

        // Filter out any null values (where dateBooking wasn't found)
        const validBookingDetails = bookingDetails.filter(detail => detail !== null);

        // Step 4: Check if any valid booking details were found
        if (validBookingDetails.length === 0) {
            return res.status(404).json({ message: 'No upcoming bookings found.' });
        }

        // Send the combined response
        res.status(200).json(validBookingDetails);
    } catch (error) {
        console.error("Error retrieving bookings:", error);
        res.status(500).json({ message: 'Error retrieving bookings', error });
    }
};


const postGoogleMeet = async (req, res) => {
    const { bookingId, googlemeetlink } = req.body;

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

        // Step 3: Send a success response
        res.status(200).json({ message: 'Google Meet link updated successfully.' });
    } catch (error) {
        console.error("Error updating Google Meet link:", error);
        res.status(500).json({ message: 'Error updating Google Meet link', error });
    }
};

module.exports = { upcomingBookings,postGoogleMeet };
