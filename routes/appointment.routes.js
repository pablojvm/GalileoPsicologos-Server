const router = require("express").Router();
const Appointment = require("../models/Appoinment.model");
const User = require("../models/User.model")
const verifyToken = require("../middlewares/auth.middlewares");
const isPsychologist = require("../middlewares/role.middleware");
const brevo = require("../config/brevo");


router.post("/", async (req, res) => {
  try {
    const { psychologist, patient, service, date, time, coment } = req.body;

    // Combinar fecha y hora
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Comprobar si ya hay cita
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

    // Crear cita
    const appointment = await Appointment.create({
      psychologist,
      patient,
      service,
      date,
      time,
      status: "pending",
      coment,
    });

    const patientData = await User.findById(patient);
    const psychologistData = await User.findById(psychologist);

    const patientEmail = patientData.email;
    const psychologistEmail = psychologistData.email;

    // --- EMAIL 1: al paciente ---
    await brevo.sendTransacEmail({
      sender: { email: process.env.BREVO_USER },
      to: [{ email: patientEmail }],
      subject: "Tu cita ha sido reservada",
      htmlContent: `
        <h2>Reserva confirmada</h2>
        <p>A continuación puedes leer los detalles de la reserva.</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p><strong>Psicólogo:</strong> ${psychologistData.username}</p>
        <p><strong>Comentario:</strong> ${coment || "Sin comentarios"}</p>
      `,
    });

    // --- EMAIL 2: al psicólogo ---
    await brevo.sendTransacEmail({
      sender: { email: process.env.BREVO_USER },
      to: [{ email: psychologistEmail }],
      subject: "Nueva cita programada",
      htmlContent: `
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