const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Não autorizado (Sem token)");
    }

    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = payload.user;

    next(); // Deixa passar
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Não autorizado (Token inválido)");
  }
};