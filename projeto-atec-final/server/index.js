const express = require('express');
const cors = require('cors'); // Permite que o frontend comunique com o backend de domínios diferentes
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors({
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Rotas de autenticação
app.use('/auth', require('./routes/auth'));
app.use('/2fa', require('./routes/2fa'));
app.use('/admin', require('./routes/admin'));
app.use('/courses', require('./routes/courses'));
app.use('/areas', require('./routes/areas'));
app.use('/modules', require('./routes/modules'));
app.use('/classes', require('./routes/classes'));
app.use('/rooms', require('./routes/rooms'));
app.use('/evaluations', require('./routes/evaluations'));
app.use('/files', require('./routes/files'));
app.use('/schedules', require('./routes/schedules'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/api/contact', require('./routes/contact')); // Rota de Contacto/Candidatura
app.use('/api/public', require('./routes/public')); // Rotas Públicas



// ROTA TESTE: Ver se a BD responde
app.get('/teste-db', async (req, res) => {
  try {
    // Tenta ir buscar a data atual e as salas
    const resultado = await pool.query('SELECT NOW()');
    res.json({
      status: 'Sucesso',
      mensagem: 'Ligação à Base de Dados efetuada.',
      hora_servidor: resultado.rows[0].now
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}/teste-db`);
  console.log(`Frontend: http://localhost`);
});