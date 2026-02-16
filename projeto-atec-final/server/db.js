const { Pool } = require('pg');
const path = require('path');
//Carrega variáveis de ambiente do ficheiro .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

//Criação de uma Pool de ligações ao PostgreSQL
//A Pool gere múltiplas ligações simultâneas para melhor performance
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

module.exports = pool;