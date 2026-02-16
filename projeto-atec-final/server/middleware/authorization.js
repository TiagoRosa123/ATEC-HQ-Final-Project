const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();

// Middleware de Autenticação
// Verifica se o pedido tem um token JWT válido no header "token"
module.exports = async (req, res, next) => {
  try {
    // Obter o token do header
    const jwtToken = req.header("token");

    //DEBUG
    //console.log("Middleware Auth - Headers recebidos:", req.headers); 
    //console.log("Middleware Auth - Token extraido:", jwtToken);

    if (!jwtToken) {
      return res.status(403).json("Não autorizado (Sem token)");
    }

    // Verificar se o token é válido usando o segredo 
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Adicionar os dados do utilizador (payload) ao objeto req
    req.user = payload.user;

    // Continuar para a próxima função (rota)
    next();
  } catch (err) {
    //console.error(err.message);
    return res.status(403).json("Não autorizado (Token inválido)");
  }
};