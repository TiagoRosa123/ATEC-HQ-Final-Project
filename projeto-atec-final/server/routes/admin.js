const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Middleware extra: Verificar se é MESMO admin
const verifyAdmin = async (req, res, next) => {
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

// --- ROTA 1: LISTAR TODOS OS UTILIZADORES (Read) ---
router.get('/todos', authorization, verifyAdmin, async (req, res) => {
  try {
    // Não devolvemos as passwords!
    const users = await pool.query("SELECT id, nome, email, ativado, is_admin FROM utilizadores");
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// --- ROTA 2: APAGAR UTILIZADOR (Delete) ---
router.delete('/apagar/:id', authorization, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Impedir que o admin se apague a si próprio (segurança básica)
    if (id == req.user.id) {
        return res.status(400).json("Não podes apagar a tua própria conta aqui.");
    }

    await pool.query("DELETE FROM utilizadores WHERE id = $1", [id]);
    res.json("Utilizador eliminado com sucesso!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// --- ROTA 3: PROMOVER A ADMIN (Update) ---
router.put('/promover/:id', authorization, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE utilizadores SET is_admin = true WHERE id = $1", [id]);
    res.json("Utilizador promovido a Administrador!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

module.exports = router;