const express = require("express");
const brevo = require("../config/brevo");
const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    const formattedTo = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : [{ email: to }];

    await brevo.sendTransacEmail({
      sender: { email: process.env.BREVO_USER },
      to: formattedTo,
      subject,
      htmlContent: message,
    });

    res.json({ success: true, message: "Correo enviado con Brevo API" });
  } catch (error) {
    console.error("Brevo API error:", error);
    res.status(500).json({ success: false, message: "Error enviando email" });
  }
});


module.exports = router;