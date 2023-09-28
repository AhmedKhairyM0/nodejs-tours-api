const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // transporter - options - send mail
    // Mailtrap
    const transporter = nodemailer.createTransport({ 
        // service: "Gmail" // Gmail is not good idea for that (spammer), // SendGrid, MailGun
        host: process.env.EMAIL_HOST,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: "Khairy Group <hello@khairy.io>",
        to: options.to,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;