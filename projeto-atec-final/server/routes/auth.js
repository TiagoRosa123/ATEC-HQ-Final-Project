const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTO DE UTILIZADOR
router.post('/registar', async (req, res) => {
  try {
    // 1. Receber dados (nome, email, password)
    const { nome, email, password } = req.body;

    // 2. Verificar se o utilizador já existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("Utilizador já existe!");
    }

    // 3. Encriptar a password (Bcrypt)
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Inserir na BD
    const newUser = await pool.query(
      "INSERT INTO utilizadores (nome, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [nome, email, bcryptPassword]
    );

    // 5. Gerar o Token JWT
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET || 'segredo_temporario', { expiresIn: '1h' });

    res.json({ token, user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// LOGIN DE UTILIZADOR
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar se utilizador existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(401).json("Password ou Email incorretos");
    }

    // 2. Verificar se a password coincide (comparar a hash)
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json("Password ou Email incorretos");
    }

    // 3. Gerar Token
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET || 'segredo_temporario', { expiresIn: '1h' });

    res.json({ token, user: user.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

module.exports = router;