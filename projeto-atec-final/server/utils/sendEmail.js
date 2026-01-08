const nodemailer = require('nodemailer');
// Tenta carregar o .env. Se o ficheiro estiver na raiz do server, isto basta.
require('dotenv').config(); 

const sendEmail = async (options) => {

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Voltamos a usar a variável segura
    },
    // Mantemos a correção do certificado que funcionou
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: '"Secretaria ATEC" <noreply@atec.pt>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email enviado com sucesso!");
};

module.exports = sendEmail;