const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");
const verifyToken = require("../middlewares/auth.middlewares");

const router = express.Router();

// ================== GOOGLE STRATEGY ==================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            username: profile.displayName,
            password: null,
            role: "patient", // por defecto
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// ================== SIGNUP ==================
router.post("/signup", async (req, res, next) => {
  const { email, password, username } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ errorMessage: "Campos requeridos: username, email, password" });
  }

  const regexPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  if (!regexPassword.test(password)) {
    return res.status(400).json({
      errorMessage:
        "La contraseña debe tener al menos una letra, un número, un caracter especial y 8-16 caracteres",
    });
  }

  try {
    if (await User.findOne({ email })) return res.status(400).json({ errorMessage: "Email ya usado" });
    if (await User.findOne({ username })) return res.status(400).json({ errorMessage: "Username no disponible" });

    const hashPassword = await bcrypt.hash(password, 12);
    await User.create({ email, password: hashPassword, username, role: "patient" });

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

// ================== LOGIN ==================
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ errorMessage: "Todos los campos son obligatorios" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ errorMessage: "Usuario no encontrado" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ errorMessage: "Contraseña inválida" });

    const payload = { _id: user._id, username: user.username, role: user.role };
    const authToken = jwt.sign(payload, process.env.SECRET_TOKEN, { algorithm: "HS256", expiresIn: "7d" });

    res.status(200).json({ authToken });
  } catch (err) {
    next(err);
  }
});

// ================== VERIFY TOKEN ==================
router.get("/verify", verifyToken, (req, res) => {
  res.json({ payload: req.payload });
});

// ================== GOOGLE AUTH ==================
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const payload = {
      _id: user._id,
      name: user.username,
      role: user.role,
    };

    const authToken = jwt.sign(payload, process.env.SECRET_TOKEN, {
      algorithm: "HS256",
      expiresIn: "7d",
    });

    // Redirige a una página intermedia del frontend que se encargará de guardar el token
    res.redirect(`${process.env.ORIGIN}/auth/callback#token=${authToken}`);
  }
);

module.exports = router;
