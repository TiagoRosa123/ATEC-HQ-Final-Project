const router = require('express').Router();
const pool = require('../db');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// ROTA 1: Config. 2FA (QR Code)
// utilizador envia email para sabermos quem é
router.post('/setup', async (req, res) => {
  try {
    const { email } = req.body;

    //Verifica utilizador
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(404).json("Utilizador não encontrado");

    // Gera o segredo único para este utilizador
    const secret = speakeasy.generateSecret({
      name: `ATEC Projeto (${email})`
    });

    // Guarda o segredo na BD (ssem ativar)
    await pool.query(
      "UPDATE utilizadores SET two_fa_secret = $1 WHERE email = $2",
      [secret.base32, email]
    );

    // Gera QR Code para enviar ao Front-end
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json("Erro ao gerar QR Code");

      res.json({
        msg: "Scanear este QR Code com o Google Authenticator",
        qrCode: data_url,
        secret: secret.base32
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

// ROTA 2: Verifica e ativa 2FA
// inserir código de 6 dígitos do Google Authenticator
router.post('/verify', async (req, res) => {
  try {
    const { email, token } = req.body; // token = código de 6 dígitos

    // Busca o segredo do utilizador na BD
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(404).json("User não encontrado");

    const secret = user.rows[0].two_fa_secret;

    // Valida o token com o Speakeasy
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      // Se o código estiver certo, ativar o 2FA 
      await pool.query("UPDATE utilizadores SET two_fa_ativado = true WHERE email = $1", [email]);
      res.json({ msg: "2FA Ativado com sucesso! A tua conta está mais segura." });
    } else {
      res.status(400).json({ msg: "Código incorreto. Tenta novamente." });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao validar 2FA");
  }
});

module.exports = router;