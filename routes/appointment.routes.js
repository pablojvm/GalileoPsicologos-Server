const router = require("express").Router();
const Appointment = require("../models/Appoinment.model");
const User = require("../models/User.model")
const verifyToken = require("../middlewares/auth.middlewares");
const isPsychologist = require("../middlewares/role.middleware");

router.post("/", async (req, res) => {
  try {
    const { psychologist, patient, service, date, coment } = req.body;

    const existingAppointment = await Appointment.findOne({
      psychologist,
      date,
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "Este psicólogo ya tiene una cita en ese horario.",
      });
    }

    // 1️⃣ Crear la nueva cita
    const appointment = await Appointment.create({
      psychologist,
      patient,
      service,
      date,
      status: "pending",
      coment,
    });

    // 2️⃣ Obtener datos para los correos
    const patientData = await User.findById(patient);
    const psychologistData = await User.findById(psychologist);

    const patientEmail = patientData.email;
    const psychologistEmail = psychologistData.email;
    const adminEmail = "tucorreo@centro.com"; // <-- cambia esto

    // 3️⃣ Configurar Nodemailer
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4️⃣ Enviar correo al paciente
    await transporter.sendMail({
      from: `"Galileo Psicólogos" <${process.env.EMAIL_USER}>`,
      to: patientEmail,
      subject: "Tu cita ha sido reservada",
      html: `
        <h2>Reserva confirmada</h2>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${new Date(date).toLocaleString()}</p>
        <p><strong>Psicólogo:</strong> ${psychologistData.name}</p>
        <p><strong>Comentario:</strong> ${coment || "Sin comentarios"}</p>
      `,
    });

    // 5️⃣ Enviar correo al psicólogo
    await transporter.sendMail({
      from: `"Galileo Psicólogos" <${process.env.EMAIL_USER}>`,
      to: psychologistEmail,
      subject: "Nueva cita programada",
      html: `
        <h2>Tienes una nueva cita</h2>
        <p><strong>Paciente:</strong> ${patientData.name}</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${new Date(date).toLocaleString()}</p>
      `,
    });

    // 7️⃣ Responder al front
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

    // Fecha inicio y fin del día
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // Buscar las citas de ese psicólogo ese día
    const appointments = await Appointment.find({
      psychologist,
      date: { $gte: start, $lte: end },
    });

    // Devolver solo las horas
    const hoursTaken = appointments.map(a => {
      const d = new Date(a.date);
      return `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    });

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