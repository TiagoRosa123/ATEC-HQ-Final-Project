const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require('speakeasy');
const sendEmail = require("../utils/sendEmail"); // <--- Importar o envio de email

// --- ROTA DE REGISTO (AGORA ENVIA EMAIL DE ATIVAÇÃO) ---
router.post("/register", async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    // 1. Verificar se user existe
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("O utilizador já existe!");
    }

    // 2. Encriptar password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 3. Criar utilizador INATIVO (ativado = false)
    const newUser = await pool.query(
      "INSERT INTO utilizadores (nome, email, password_hash, ativado) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, email, bcryptPassword, false] 
    );

    // 4. Gerar token de ativação
    const activationToken = jwt.sign(
        { user: { id: newUser.rows[0].id } }, 
        "segredo123", 
        { expiresIn: "1d" }
    );

    // 5. Enviar Email
    const url = `http://localhost:3000/activate/${activationToken}`;
    
    await sendEmail({
        email: email,
        subject: 'Bem-vindo à ATEC! Ativa a tua conta',
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

// --- ROTA PARA ATIVAR A CONTA (QUANDO CLICAM NO LINK) ---
router.post("/activate-account", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json("Token inválido.");

        const decoded = jwt.verify(token, "segredo123");
        const userId = decoded.user.id;

        await pool.query("UPDATE utilizadores SET ativado = $1 WHERE id = $2", [true, userId]);

        res.json("Conta ativada com sucesso!");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Link inválido ou expirado.");
    }
});

// --- ROTA DE LOGIN (MANTEVE-SE IGUAL) ---
router.post("/login", async (req, res) => {
  try {
    const { email, password, token2fa } = req.body;
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);

    if (user.rows.length === 0) return res.status(401).json({ message: "Dados incorretos" });

    // VERIFICA SE A CONTA ESTÁ ATIVA
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

    const token = jwt.sign({ user: { id: user.rows[0].id } }, "segredo123", { expiresIn: "1h" });
    res.json({ token, user: user.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// --- ROTA GOOGLE ---
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
    const token = jwt.sign({ user: { id: userId } }, "segredo123", { expiresIn: "1h" });
    res.json({ token, user: { id: userId, nome, email } });
  } catch (err) { res.status(500).send("Erro no servidor"); }
});

// --- ROTAS 2FA SETUP ---
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

module.exports = router;