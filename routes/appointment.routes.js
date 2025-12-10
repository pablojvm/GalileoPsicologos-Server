const router = require("express").Router();
const Appointment = require("../models/Appoinment.model");
const User = require("../models/User.model");
const verifyToken = require("../middlewares/auth.middlewares");
const brevo = require("../config/brevo");

router.post("/", async (req, res) => {
  try {
    const { psychologist, patient, service, date, time, coment } = req.body;

    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

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

    await brevo.sendTransacEmail({
      sender: { email: process.env.BREVO_USER },
      to: [{ email: patientEmail }],
      subject: "Tu solicitud de reserva ha sido enviada",
      htmlContent: `
        <h2>Reserva pendiente</h2>
        <p>Detalles de la reserva:</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p><strong>Psicólogo:</strong> ${psychologistData.username}</p>
        <p><strong>Comentario:</strong> ${coment || "Sin comentarios"}</p>
      `,
    });

    await brevo.sendTransacEmail({
      sender: { email: process.env.BREVO_USER },
      to: [{ email: psychologistEmail }],
      subject: "Nueva cita programada",
      htmlContent: `
        <h2>Tienes una nueva cita</h2>
        <p>Detalles de la reserva:</p>
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

    const appointments = await Appointment.find({
      psychologist,
      date,
    });

    const hoursTaken = appointments.map(a => a.time);

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

// PATCH para actualizar estado e integrar envío de emails con Brevo
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    appointment.status = status;
    await appointment.save();

    // Obtener datos del paciente y psicólogo
    const patientData = await User.findById(appointment.patient);
    const psychologistData = await User.findById(appointment.psychologist);

    const patientEmail = patientData.email;
    const psychologistEmail = psychologistData.email;

    const { service, date, time, coment } = appointment;

    const patientSubject =
      status === "confirmed"
        ? "Tu cita ha sido confirmada"
        : status === "cancelled"
        ? "Tu cita ha sido cancelada"
        : "Reserva pendiente";

    const psychologistSubject =
      status === "confirmed"
        ? "Cita confirmada con tu paciente"
        : status === "cancelled"
        ? "Cita cancelada"
        : "Nueva cita programada";

    await brevo.sendTransacEmail({
      sender: { email: process.env.BREVO_USER },
      to: [{ email: patientEmail }],
      subject: patientSubject,
      htmlContent: `
        <h2>${patientSubject}</h2>
        <p>Detalles de la reserva:</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p><strong>Psicólogo:</strong> ${psychologistData.username}</p>
        <p><strong>Comentario:</strong> ${coment || "Sin comentarios"}</p>
      `,
    });

    await brevo.sendTransacEmail({
      sender: { email: process.env.BREVO_USER },
      to: [{ email: psychologistEmail }],
      subject: psychologistSubject,
      htmlContent: `
        <h2>${psychologistSubject}</h2>
        <p>Detalles de la reserva:</p>
        <p><strong>Paciente:</strong> ${patientData.username}</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
      `,
    });

    res.status(200).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error actualizando la cita" });
  }
});

module.exports = router;
