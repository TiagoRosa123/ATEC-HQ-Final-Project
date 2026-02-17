const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE '%inscricoes%';
        `);
        console.log("Tabela encontrada:", res.rows);
        if (res.rows.length > 0) {
            const cols = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${res.rows[0].table_name}';
            `);
            console.log("Colunas:", cols.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkSchema();
