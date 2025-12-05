const router = require("express").Router();
const Appointment = require("../models/Appoinment.model");
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

    // 3️⃣ Crear la nueva cita
    const appointment = await Appointment.create({
      psychologist,
      patient,
      service,
      date,
      status: "pending",
      coment,
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