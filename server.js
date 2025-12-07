const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");

const app = express();

// Middleware CORS global
app.use(cors({
  origin: process.env.ORIGIN, // tu frontend
  credentials: true,
}));

// Permitir preflight (OPTIONS) en todas las rutas
app.options("*", cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Config adicional
const config = require("./config");
config(app);

// Rutas
const indexRouter = require("./routes/index.routes");
app.use("/api", indexRouter);

// Manejo de errores
const handleErrors = require("./errors");
handleErrors(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening. Local access on http://localhost:${PORT}`);
});
