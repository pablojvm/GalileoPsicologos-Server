const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");

const app = express();

app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));

app.options("*", cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = require("./config");
config(app);

const indexRouter = require("./routes/index.routes");
app.use("/api", indexRouter);

const handleErrors = require("./errors");
handleErrors(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening. Local access on http://localhost:${PORT}`);
});
