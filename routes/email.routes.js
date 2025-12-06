const express = require("express");
const { transporter } = require("../config/nodemailer.js");

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Tu App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    res.json({ success: true, message: "Correo enviado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error enviando email" });
  }
});

module.exports = router;