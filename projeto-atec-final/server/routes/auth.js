const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// --- ROTA DE REGISTO ---
router.post('/registar', async (req, res) => {
  try {
    // 1. Extração de dados do corpo da requisição
    const { nome, email, password } = req.body;

    // 2. Verificar se o utilizador já existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("O utilizador já existe!");
    }

    // 3. Encriptar a password (Bcrypt) - Requisito 1.c
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Gerar Token de Ativação - Requisito 1.b
    const activationToken = crypto.randomBytes(20).toString('hex');

    // 5. Inserir na Base de Dados
    // Certifica-te que a tua tabela tem estas colunas: nome, email, password_hash, token_ativacao, ativado
    const newUser = await pool.query(
      "INSERT INTO utilizadores (nome, email, password_hash, token_ativacao, ativado) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, email, bcryptPassword, activationToken, false]
    );

    // 6. Enviar Email de Ativação usando o utilitário
    const activationUrl = `http://localhost:5000/auth/ativar/${activationToken}`;

    try {
      await sendEmail({
        email: email,
        subject: 'Ativação de Conta - Projeto ATEC',
        message: `Olá ${nome}, por favor ativa a tua conta clicando no link: ${activationUrl}`,
        html: `
          <h1>Bem-vindo à ATEC</h1>
          <p>Olá <strong>${nome}</strong>,</p>
          <p>Para começares a usar a plataforma, precisas de ativar a tua conta.</p>
          <a href="${activationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ativar Minha Conta</a>
        `
      });

      res.json({ 
        msg: "Utilizador registado! Verifica o teu email (Mailtrap) para ativar a conta.",
        user: newUser.rows[0] 
      });

    } catch (mailError) {
      console.error("Erro ao enviar email:", mailError);
      res.status(500).json("Utilizador criado, mas houve um erro ao enviar o email de ativação.");
    }

  } catch (err) {
    console.error("Erro no servidor:", err.message);
    res.status(500).send("Erro no servidor ao tentar registar.");
  }
});

// --- ROTA DE ATIVAÇÃO ---
router.get('/ativar/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Procura o utilizador com o token e ativa-o
    const result = await pool.query(
      "UPDATE utilizadores SET ativado = true, token_ativacao = NULL WHERE token_ativacao = $1 RETURNING *",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("<h1>Token inválido ou expirado.</h1>");
    }

    res.send("<h1>Conta ativada com sucesso!</h1><p>Já podes fechar esta janela e fazer login.</p>");

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao processar a ativação.");
  }
});

// --- ROTA DE LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar se o utilizador existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(401).json("Email ou password incorretos.");
    }

    // 2. Verificar se a conta está ativada
    if (!user.rows[0].ativado) {
      return res.status(403).json("A tua conta ainda não foi ativada. Verifica o teu email.");
    }

    // 3. Comparar passwords
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json("Email ou password incorretos.");
    }

    // 4. Gerar JWT
    const token = jwt.sign(
      { id: user.rows[0].id }, 
      process.env.JWT_SECRET || 'chave_secreta_atec', 
      { expiresIn: '2h' }
    );

    res.json({ token, user: { id: user.rows[0].id, nome: user.rows[0].nome, email: user.rows[0].email } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor ao fazer login.");
  }
});

module.exports = router;