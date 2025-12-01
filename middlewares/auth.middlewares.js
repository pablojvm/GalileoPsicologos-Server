const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  console.log("Ejecutando middleware");

  try {
    const tokenText = req.headers.authorization;
    const token = tokenText.split(" ")[1];

    const payload = jwt.verify(token, process.env.SECRET_TOKEN);

    req.payload = payload;

    next();
  } catch (error) {
    res.status(401).json({ errorMessage: "Token no existe o no es valido" });
  }
}

module.exports = verifyToken;
