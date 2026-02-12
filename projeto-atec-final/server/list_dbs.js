const { Client } = require('pg');
require('dotenv').config();

async function listDatabases() {
    const client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'postgres'
    });

    try {
        await client.connect();
        const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        console.log("\n📍 Bases de Dados encontradas:");
        res.rows.forEach(row => console.log(` - ${row.datname}`));

        console.log(`\n👉 O servidor está ligado a: ${process.env.DB_NAME}`);
    } catch (err) {
        console.error("Erro:", err);
    } finally {
        client.end();
    }
}

listDatabases();
