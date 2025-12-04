import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestEmail() {
  try {
    await transporter.sendMail({
      from: `"Galileo Psicólogos" <${process.env.EMAIL_USER}>`,
      to: "mvillarmoron@gmail.com", // prueba con tu otro correo
      subject: "Correo de prueba desde Nodemailer",
      html: "<p>¡Hola! Este es un correo de prueba.</p>",
    });
    console.log("Correo enviado correctamente");
  } catch (err) {
    console.error("Error enviando correo:", err);
  }
}

sendTestEmail();
