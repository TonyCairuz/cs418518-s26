// Load environment variables from .env file
import "dotenv/config";
// Import nodemailer's createTransport function
import { createTransport } from "nodemailer";
/**
* Sends an email using SMTP (Gmail in this case)
* 
* @param {string} email - Recipient's email address
* @param {string} mailSubject - Subject of the email
* @param {string} body - HTML content of the email
*/
export async function sendEmail(email, mailSubject, body) {
    const transport = createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Course Advising System" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: mailSubject,
        html: body,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log("Email sent successfully to " + email, info.messageId);
        return info;
    } catch (err) {
        console.error("Error in sending email to " + email + ":", err.message);
        // We don't throw here to avoid crashing the route if email fails, 
        // but we return the error so the caller can know.
        return { error: err.message };
    }
}

