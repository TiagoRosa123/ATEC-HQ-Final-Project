const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const speakeasy = require('speakeasy');

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

// --- ROTA DE LOGIN COM 2FA ---
router.post('/login', async (req, res) => {
  try {
    // Agora aceitamos também o token2fa (opcional no início)
    const { email, password, token2fa } = req.body;

    // 1. Verificar se o utilizador existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(401).json("Email ou password incorretos.");
    }

    const currentUser = user.rows[0];

    // 2. Verificar se a conta está ativada (Email)
    if (!currentUser.ativado) {
      return res.status(403).json("A tua conta ainda não foi ativada. Verifica o teu email.");
    }

    // 3. Comparar passwords
    const validPassword = await bcrypt.compare(password, currentUser.password_hash);
    if (!validPassword) {
      return res.status(401).json("Email ou password incorretos.");
    }

    // --- NOVO: LÓGICA DE 2FA ---
    
    // Se o utilizador tem 2FA ativado na BD...
    if (currentUser.two_fa_ativado) {
      
      // ... e NÃO enviou o código no pedido:
      if (!token2fa) {
        return res.status(400).json({ 
          msg: "Código 2FA necessário", 
          require2fa: true // O Front-end usa isto para saber que deve mostrar o campo do código
        });
      }

      // ... e enviou o código, vamos validar:
      const verified = speakeasy.totp.verify({
        secret: currentUser.two_fa_secret,
        encoding: 'base32',
        token: token2fa
      });

      if (!verified) {
        return res.status(401).json("Código 2FA incorreto!");
      }
    }
    // ---------------------------

    // 4. Se passou tudo, gerar JWT
    const token = jwt.sign(
      { id: currentUser.id }, 
      process.env.JWT_SECRET || 'chave_secreta_atec', 
      { expiresIn: '2h' }
    );

    res.json({ token, user: { id: currentUser.id, nome: currentUser.nome, email: currentUser.email } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor ao fazer login.");
  }
});

// --- ROTA 1: PEDIDO DE RECUPERAÇÃO (ESQUECI-ME DA SENHA) ---
router.post('/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Verificar se o utilizador existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json("Utilizador não encontrado.");
    }

    // 2. Gerar Token de Reset e Data de Expiração (1 hora)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expireDate = new Date(Date.now() + 3600000); // Hoje + 1 hora

    // 3. Guardar Token na BD
    await pool.query(
      "UPDATE utilizadores SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [resetToken, expireDate, email]
    );

    // 4. Enviar Email
    const resetUrl = `http://localhost:5000/auth/reset-senha/${resetToken}`; // Link para testar no Backend
    // Nota: Quando tiver Front-end, o link será algo como localhost:3000/reset/...

    await sendEmail({
      email: email,
      subject: 'Recuperação de Password - ATEC',
      message: `Recebemos um pedido para alterar a tua senha. Vai a: ${resetUrl}`,
      html: `
        <h3>Recuperação de Password</h3>
        <p>Alguém pediu para alterar a senha da conta associada a este email.</p>
        <p>Clica no botão abaixo para definir uma nova senha (válido por 1 hora):</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Password</a>
        <p>Se não foste tu, ignora este email.</p>
      `
    });

    res.json({ msg: "Email de recuperação enviado!" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao processar o pedido.");
  }
});

// --- ROTA 2: DEFINIR NOVA SENHA ---
router.post('/reset-senha/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body; // A nova senha

    // 1. Procurar utilizador com este token E que o prazo não tenha expirado
    // Nota: $2 é a data/hora atual
    const user = await pool.query(
      "SELECT * FROM utilizadores WHERE reset_password_token = $1 AND reset_password_expires > $2",
      [token, new Date()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json("Token inválido ou expirado.");
    }

    // 2. Encriptar a nova password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 3. Atualizar a BD e limpar os tokens
    await pool.query(
      "UPDATE utilizadores SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [bcryptPassword, user.rows[0].id]
    );

    res.json({ msg: "Password alterada com sucesso! Já podes fazer login." });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao alterar password.");
  }
});

module.exports = router;