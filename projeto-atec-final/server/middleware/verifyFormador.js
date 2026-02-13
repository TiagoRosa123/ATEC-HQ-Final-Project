const pool = require("../db");

// Middleware: Permite Admin ou Formador
module.exports = async (req, res, next) => {
  try {
    const user = await pool.query(
      "SELECT role, is_admin FROM utilizadores WHERE id = $1",
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(403).json("Utilizador não encontrado.");
    }

    const { role, is_admin } = user.rows[0];

    if (!is_admin && role !== 'formador') {
      return res.status(403).json("Acesso negado. Apenas para Administradores ou Formadores.");
    }

    next();
  } catch (err) {
    res.status(500).send("Erro ao verificar permissões");
  }
};
