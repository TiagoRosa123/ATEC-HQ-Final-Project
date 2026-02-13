const pool = require("../db");

// Middleware: Permite apenas Admin ou Secretária
module.exports = async (req, res, next) => {
  try {
    const user = await pool.query(
      "SELECT role, is_admin FROM utilizadores WHERE id = $1",
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(403).json("Acesso negado.");
    }

    const { role, is_admin } = user.rows[0];

    if (is_admin || role === 'secretaria') {
      return next();
    }

    return res.status(403).json("Acesso negado. Apenas para Administradores ou Secretária.");
  } catch (err) {
    console.error(err.message);
    return res.status(500).json("Erro ao verificar permissões.");
  }
};
