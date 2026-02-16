const nodemailer = require('nodemailer'); //"Carteiro"
require('dotenv').config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  //busca email
      pass: process.env.EMAIL_PASS  //busca PW
    },
    tls: { rejectUnauthorized: false }
  });

  const mailOptions = {
    from: '"Secretaria ATEC.HQ" <noreply@atec-hq.pt>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email enviado para: " + options.email);
};

module.exports = sendEmail;