"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactUs = void 0;
const emailQueue_1 = require("../queues/emailQueue"); // Adjust path as needed
const contactUs = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ message: "Name, email, and message are required." });
        }
        // Add to email queue
        await emailQueue_1.emailQueue.add("sendEmail", {
            to: process.env.BREVO_FROM,
            from: email,
            name,
            subject: "New Message",
            html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
        }, {
            attempts: 2,
            backoff: {
                type: 'fixed',
                delay: 2000,
            },
        });
        return res.status(200).json({ message: "Your message has been received. Thank you for contacting us!" });
    }
    catch (error) {
        console.error("Contact form error:", error);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};
exports.contactUs = contactUs;
