const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER, // normalmente es tu email de brevo
    pass: process.env.BREVO_SMTP_KEY,
  },
  connectionTimeout: 20000,
});

transporter.verify((err, success) => {
  if (err) console.error("SMTP verify error:", err);
  else console.log("SMTP ready with Brevo");
});

module.exports = { transporter };

