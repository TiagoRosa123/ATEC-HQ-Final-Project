const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Não autorizado (Falta Token)");
    }

    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET || 'chave_secreta_atec');

    // --- CORREÇÃO AQUI ---
    // Antes estava req.user = payload.user; (Isto dava erro)
    req.user = payload; 
    // ---------------------
    
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Token inválido ou expirado");
  }
};