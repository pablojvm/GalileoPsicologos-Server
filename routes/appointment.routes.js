const router = require("express").Router();
const Appointment = require("../models/Appoinment.model");
const User = require("../models/User.model")
const verifyToken = require("../middlewares/auth.middlewares");
const isPsychologist = require("../middlewares/role.middleware");

router.post("/", async (req, res) => {
  try {
    const { psychologist, patient, service, date, time, coment } = req.body;

    // Combinar fecha y hora para buscar conflictos
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Comprobar si ya hay cita en ese horario
    const existingAppointment = await Appointment.findOne({
      psychologist,
      date,
      time,
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "Este psicólogo ya tiene una cita en ese horario.",
      });
    }

    // Crear la nueva cita
    const appointment = await Appointment.create({
      psychologist,
      patient,
      service,
      date, // YYYY/MM/DD
      time, // HH:MM
      status: "pending",
      coment,
    });

    const patientData = await User.findById(patient);
    const psychologistData = await User.findById(psychologist);

    const patientEmail = patientData.email;
    const psychologistEmail = psychologistData.email;
    const adminEmail = "tucorreo@centro.com"; 

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enviar correo al paciente
    await transporter.sendMail({
      from: `"Galileo Psicólogos" <${process.env.EMAIL_USER}>`,
      to: patientEmail,
      subject: "Tu cita ha sido reservada",
      html: `
        <h2>Reserva confirmada</h2>
        <p>A continuación puedes leer los detalles de la reserva.</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p><strong>Psicólogo:</strong> ${psychologistData.username}</p>
        <p><strong>Comentario:</strong> ${coment || "Sin comentarios"}</p>
      `,
    });

    // Enviar correo al psicólogo
    await transporter.sendMail({
      from: `"Galileo Psicólogos" <${process.env.EMAIL_USER}>`,
      to: psychologistEmail,
      subject: "Nueva cita programada",
      html: `
        <h2>Tienes una nueva cita</h2>
        <p>A continuación puedes leer los detalles de la reserva.</p>
        <p><strong>Paciente:</strong> ${patientData.username}</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
      `,
    });

    res.status(201).json(appointment);

  } catch (err) {
    console.error("Error creando cita:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});



router.get("/availability", async (req, res) => {
  try {
    const { psychologist, date } = req.query;

    if (!psychologist || !date) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    // Buscar las citas del psicólogo en esa fecha exacta
    const appointments = await Appointment.find({
      psychologist,
      date, // ahora date es "YYYY/MM/DD"
    });

    // Devolver solo las horas ocupadas
    const hoursTaken = appointments.map(a => a.time); // time = "HH:MM"

    res.json(hoursTaken);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo disponibilidad" });
  }
});

router.get("/my-schedule", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ psychologist: req.payload._id })
      .populate("patient", "username email")
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    console.error("Error obteniendo agenda:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;