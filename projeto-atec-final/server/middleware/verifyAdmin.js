const pool = require("../db");

// Middleware: Permite apenas Administradores
module.exports = async (req, res, next) => {
  try {
    const user = await pool.query("SELECT * FROM utilizadores WHERE id = $1", [req.user.id]);

    if (user.rows.length === 0 || !user.rows[0].is_admin) {
      return res.status(403).json("Acesso negado. Apenas para Administradores.");
    }
    next();
  } catch (err) {
    res.status(500).send("Erro ao verificar permissões");
  }
};
