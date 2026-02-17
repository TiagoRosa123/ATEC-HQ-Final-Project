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

async function checkUserPhoto() {
    try {
        const res = await pool.query("SELECT id, nome, email, role, foto FROM utilizadores WHERE nome LIKE '%Hugo%'");
        console.log("Users found:", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkUserPhoto();
