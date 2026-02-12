const { Client } = require('pg');
require('dotenv').config();

async function listUsers() {
    const client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME // ATEC_HQ
    });

    try {
        await client.connect();
        console.log(`\n👥 Utilizadores na Base de Dados: ${process.env.DB_NAME}\n`);

        const res = await client.query("SELECT id, nome, email, ativado, role FROM utilizadores ORDER BY id");
        console.table(res.rows);

    } catch (err) {
        console.error("Erro ao conectar:", err.message);
    } finally {
        client.end();
    }
}

listUsers();
