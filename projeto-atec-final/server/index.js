const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite ler JSON no corpo das requisições

// Rotas de autenticação
app.use('/auth', require('./routes/auth'));
app.use('/2fa', require('./routes/2fa'));
app.use('/admin', require('./routes/admin'));

// ROTA DE TESTE: Verificar se a BD responde
app.get('/teste-db', async (req, res) => {
  try {
    // Tenta ir buscar a data atual e as salas
    const resultado = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'Sucesso!', 
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
});