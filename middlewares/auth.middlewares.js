const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
      return res.status(401).json({ errorMessage: "Falta el token de autenticación" });
    }

    const token = tokenHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ errorMessage: "Formato de token inválido" });
    }

    const payload = jwt.verify(token, process.env.SECRET_TOKEN);
    req.payload = payload;

    next();
  } catch (error) {
    res.status(401).json({ errorMessage: "Token no existe o no es válido" });
  }
}

module.exports = verifyToken;
