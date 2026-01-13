const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Não autorizado (Sem token)");
    }

    const payload = jwt.verify(jwtToken, "segredo123");
    req.user = payload.user;

    // Se a rota for de Admin, verifica na BD
    if (req.isAdminRoute) {
        const user = await pool.query("SELECT is_admin FROM utilizadores WHERE id = $1", [req.user.id]);
        if (user.rows.length === 0 || !user.rows[0].is_admin) {
            return res.status(403).json("Acesso Negado: Apenas para Administradores.");
        }
    }

    next(); // Deixa passar
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Não autorizado (Token inválido)");
  }
};