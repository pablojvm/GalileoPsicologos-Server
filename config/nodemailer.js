const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 465),
  secure: process.env.EMAIL_SECURE === "true" || true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
});


transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP verify error:", err);
  } else {
    console.log("SMTP configured and ready");
  }
});

module.exports = { transporter };
