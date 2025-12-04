const router = require("express").Router();
const User = require("../models/User.model");

router.get("/psychologists", async (req, res, next) => {
  try {
    // Buscar todos los usuarios con role 'psychologist'
    const psychologists = await User.find({ role: "psychologist" })
    res.status(200).json(psychologists);
  } catch (err) {
    next(err);
  }
});

module.exports = router;