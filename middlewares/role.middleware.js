function isPsychologist(req, res, next) {
  if (req.payload?.role === "psychologist") {
    return next();
  }
  return res.status(403).json({ message: "Acceso denegado: solo psicólogos" });
}

module.exports = isPsychologist;
