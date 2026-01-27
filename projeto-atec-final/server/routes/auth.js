const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require('speakeasy');
const sendEmail = require("../utils/sendEmail");

// ROTA DE REGISTO: Envia email de ativação
router.post("/register", async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    // Verifica se user existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("O utilizador já existe!");
    }

    // Encripta password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Criar utilizador 
    const newUser = await pool.query(
      "INSERT INTO utilizadores (nome, email, password_hash, ativado) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, email, bcryptPassword, false]
    );

    // Gera token de ativação
    const activationToken = jwt.sign(
      { user: { id: newUser.rows[0].id } },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Envia Email
    const url = `http://localhost:3000/activate/${activationToken}`;

    await sendEmail({
      email: email,
      subject: 'Bem-vindo à ATEC.HQ! Ativa a tua conta',
      message: `Olá ${nome}, clica aqui: ${url}`,
      html: `
            <h1>Bem-vindo, ${nome}!</h1>
            <p>Por favor ativa a tua conta para entrar:</p>
            <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ativar Conta</a>
        `
    });

    res.json({ message: "Registo efetuado! Verifica o email." });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// ROTA ATIVAR CONTA - Quando clicam link
router.post("/activate-account", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json("Token inválido.");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    await pool.query("UPDATE utilizadores SET ativado = $1 WHERE id = $2", [true, userId]);

    res.json("Conta ativada com sucesso!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Link inválido ou expirado.");
  }
});

// ROTA DE LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, token2fa } = req.body;
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);

    if (user.rows.length === 0) return res.status(401).json({ message: "Dados incorretos" });

    // Verifica se conta está ativa
    if (user.rows[0].ativado === false) {
      return res.status(401).json({ message: "Tens de ativar a conta no teu email primeiro!" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) return res.status(401).json({ message: "Dados incorretos" });

    // Lógica 2FA
    if (user.rows[0].two_fa_ativado) {
      if (!token2fa) return res.status(400).json({ require2fa: true });
      const verified = speakeasy.totp.verify({
        secret: user.rows[0].two_fa_secret,
        encoding: 'base32',
        token: token2fa
      });
      if (!verified) return res.status(401).json({ message: "Código 2FA incorreto" });
    }

    const token = jwt.sign({ user: { id: user.rows[0].id } }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Remover dados sensíveis antes de enviar para o frontend
    const { password_hash, two_fa_secret, reset_password_token, ...userSafe } = user.rows[0];

    res.json({ token, user: userSafe });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// ROTA GOOGLE
router.post('/google', async (req, res) => {
  try {
    const { email, nome } = req.body;
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    let userId;
    if (user.rows.length > 0) {
      userId = user.rows[0].id;
    } else {
      const randomPass = await bcrypt.hash(Math.random().toString(), 10);
      const newUser = await pool.query(
        "INSERT INTO utilizadores (nome, email, password_hash, ativado) VALUES ($1, $2, $3, $4) RETURNING id",
        [nome, email, randomPass, true]
      );
      userId = newUser.rows[0].id;
    }
    const token = jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Buscar dados atualizados do user (incluindo is_admin e role)
    const fullUser = await pool.query("SELECT id, nome, email, is_admin, role, ativado, two_fa_ativado, criado_em FROM utilizadores WHERE id = $1", [userId]);

    res.json({ token, user: fullUser.rows[0] });
  } catch (err) { res.status(500).send("Erro no servidor"); }
});

// ROTA envia email de recuperação de password
router.post('/esqueci-Pw', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const resetToken = jwt.sign(
      { user: { id: user.rows[0].id } },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const url = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail({
      email: email,
      subject: 'Recuperação de Password - ATEC.HQ',
      message: `Clica aqui para repor a password: ${url}`,
      html: `
        <h1>Recuperar Password</h1>
        <p>Recebemos um pedido para alterar a tua password. Clica no botão abaixo:</p>
        <a href="${url}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Repor Password</a>
        <p>Se não foste tu, ignora este email.</p>
      `
    });

    res.json({ message: "Email enviado!" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// ROTA define nova password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return res.status(400).json({ message: "Token em falta" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    await pool.query("UPDATE utilizadores SET password_hash = $1 WHERE id = $2", [bcryptPassword, userId]);

    res.json({ message: "Password alterada com sucesso!" });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Token inválido ou expirado." });
  }
});

// ROTAS 2FA
router.post('/2fa/setup', async (req, res) => {
  try {
    const { email } = req.body;
    const secret = speakeasy.generateSecret({ length: 20 });
    await pool.query("UPDATE utilizadores SET two_fa_secret = $1 WHERE email = $2", [secret.base32, email]);
    const otpauthUrl = speakeasy.otpauthURL({ secret: secret.base32, label: `Projeto Atec (${email})`, encoding: 'base32' });
    res.json({ secret: secret.base32, otpauthUrl });
  } catch (err) { res.status(500).send("Erro"); }
});

router.post('/2fa/verify', async (req, res) => {
  try {
    const { email, token, secret } = req.body;
    const verified = speakeasy.totp.verify({ secret: secret, encoding: 'base32', token: token });
    if (verified) {
      await pool.query("UPDATE utilizadores SET two_fa_ativado = $1 WHERE email = $2", [true, email]);
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: "Código incorreto" });
    }
  } catch (err) { res.status(500).send("Erro"); }
});

// ROTA atualiza password 
router.put("/update", async (req, res) => {
  try {
    const { id, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    await pool.query("UPDATE utilizadores SET password_hash = $1 WHERE id = $2", [bcryptPassword, id]);

    res.json("Password atualizada!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao atualizar password");
  }
});

module.exports = router;