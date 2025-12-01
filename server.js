try {
  process.loadEnvFile()
} catch(error) {
  console.warn(".env file not found, using default environment values")
}

require("./db");

const express = require("express");
const app = express();

const config = require("./config")
config(app);

const indexRouter = require("./routes/index.routes");
app.use("/api", indexRouter);

const handleErrors = require("./errors")
handleErrors(app);

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server listening. Local access on http://localhost:${PORT}`);
});
