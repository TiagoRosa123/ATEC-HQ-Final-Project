const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");

    //DEBUG
    //console.log("Middleware Auth - Headers recebidos:", req.headers); 
    //console.log("Middleware Auth - Token extraido:", jwtToken);

    if (!jwtToken) {
      //console.log("Middleware Auth - REJEITADO: Sem token!"); 
      return res.status(403).json("Não autorizado (Sem token)");
    }

    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = payload.user;

    next();
  } catch (err) {
    //console.error(err.message);
    return res.status(403).json("Não autorizado (Token inválido)");
  }
};