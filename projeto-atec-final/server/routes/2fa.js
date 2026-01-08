const router = require('express').Router();
const pool = require('../db');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// --- ROTA 1: CONFIGURAR 2FA (Gerar QR Code) ---
// O utilizador tem de enviar o email (ou ID) para sabermos quem é
router.post('/setup', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Verificar utilizador
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(404).json("Utilizador não encontrado");

    // 2. Gerar o segredo único para este utilizador
    const secret = speakeasy.generateSecret({
      name: `ATEC Projeto (${email})` // O nome que aparece na App do Google
    });

    // 3. Guardar o segredo na BD (mas ainda NÃO ativar)
    // Guardamos o secret.base32 que é a versão texto da chave
    await pool.query(
      "UPDATE utilizadores SET two_fa_secret = $1 WHERE email = $2",
      [secret.base32, email]
    );

    // 4. Gerar o QR Code para enviar ao Front-end
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json("Erro ao gerar QR Code");
      
      // Enviamos a imagem (data_url) e o segredo em texto (caso a camera não funcione)
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

// --- ROTA 2: VERIFICAR E ATIVAR ---
// O utilizador insere o código de 6 dígitos que aparece no telemóvel para confirmar
router.post('/verify', async (req, res) => {
  try {
    const { email, token } = req.body; // token é o código de 6 dígitos

    // 1. Buscar o segredo do utilizador na BD
    const user = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(404).json("User não encontrado");

    const secret = user.rows[0].two_fa_secret;

    // 2. Validar o token com o Speakeasy
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      // 3. Se o código estiver certo, ativamos o 2FA permanentemente
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