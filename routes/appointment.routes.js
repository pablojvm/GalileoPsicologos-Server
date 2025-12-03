const router = require("express").Router();
const Appointment = require("../models/Appoinment.model");

router.post("/", async (req, res) => {
  try {
    const { psychologist, patient, service, date, coment } = req.body;

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

module.exports = router;