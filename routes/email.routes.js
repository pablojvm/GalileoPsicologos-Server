const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, error: "Faltan campos requeridos" });
  }

  try {
    const brevoEndpoint = "https://api.brevo.com/v3/smtp/email";

    const emailBody = {
      sender: {
        name: "Galileo Psicólogos",
        email: "galileopsi@gmail.com", // Debe coincidir con el remitente validado en Brevo
      },
      to: [{ email: to }],
      subject,
      htmlContent: message,
    };

    await axios.post(brevoEndpoint, emailBody, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    res.json({ success: true, message: "Correo enviado con éxito" });

  } catch (error) {
    console.error("Error Brevo:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Error enviando correo" });
  }
});

module.exports = router;