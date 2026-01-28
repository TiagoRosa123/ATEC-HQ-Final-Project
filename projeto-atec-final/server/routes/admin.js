const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const bcrypt = require("bcrypt");

// Verificar se é MESMO admin
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

// ROTA 1: lista todos users - Read
router.get('/todos', authorization, verifyAdmin, async (req, res) => {
  try {
    const users = await pool.query("SELECT id, nome, email, ativado, is_admin, role FROM utilizadores");
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// ROTA 2: Del. user 
router.delete('/apagar/:id', authorization, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    //Impede que o admin se apague a si próprio (segurança básica)
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

// ROTA 3: Promove admin - Update
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

// ROTA 3.1: Editar dados - Update (COM SINCRONIZAÇÃO DE TABELAS)
router.put('/editar/:id', authorization, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, is_admin, role } = req.body;

    // 1. Atualizar Utilizador Geral
    await pool.query(
      "UPDATE utilizadores SET nome = $1, email = $2, role = $3, is_admin = $4 WHERE id = $5",
      [nome, email, role, is_admin, id]
    );

    // 2. Verificar e criar registo na tabela específica, se não existir
    if (role === 'formando') {
      // Tenta inserir. Se já existir, não faz nada (ON CONFLICT DO NOTHING requer constraint) 
      // Em vez disso, verificamos antes:
      const check = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [id]);
      if (check.rows.length === 0) {
        await pool.query("INSERT INTO formandos (utilizador_id, nome) VALUES ($1, $2)", [id, nome]);
      }
    }
    else if (role === 'formador') {
      const check = await pool.query("SELECT id FROM formadores WHERE utilizador_id = $1", [id]);
      if (check.rows.length === 0) {
        await pool.query("INSERT INTO formadores (utilizador_id, nome) VALUES ($1, $2)", [id, nome]);
      }
    }

    res.json("Utilizador atualizado e perfil sincronizado!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao atualizar utilizador");
  }
});

// ROTA 4: Cria user - Create
router.post('/criar', authorization, verifyAdmin, async (req, res) => {
  try {
    const { nome, email, password, role } = req.body; //role vem do frontend

    // Verifica se user existe
    const userExist = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(401).json("Utilizador já existe!");
    }

    // Encripta a password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Se for 'admin', então is_admin= true
    const is_admin = (role === 'admin');

    // Insere na BD
    const newUser = await pool.query(
      "INSERT INTO utilizadores (nome, email, password_hash, role, is_admin, ativado) VALUES ($1, $2, $3, $4, $5, true) RETURNING *",
      [nome, email, bcryptPassword, role, is_admin]
    );

    const newUserId = newUser.rows[0].id;

    if (role === 'formando') {
      await pool.query("INSERT INTO formandos (utilizador_id, nome) VALUES ($1, $2)", [newUserId, nome]);
    }
    else if (role === 'formador') {
      await pool.query("INSERT INTO formadores (utilizador_id, nome) VALUES ($1, $2)", [newUserId, nome]);
    }

    res.json(newUser.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao criar utilizador");
  }
});

module.exports = router;