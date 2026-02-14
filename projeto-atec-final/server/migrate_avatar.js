const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const migrate = async () => {
    try {
        console.log("Checking database connection...");
        // Force SSL if in production or needed, but usually local docker doesn't need it.
        // However, existing db.js might have specific config. I'm using standard env vars.

        await pool.query("ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS foto TEXT;");
        console.log("Success: 'foto' column added to 'utilizadores' table (if it didn't exist).");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        await pool.end();
    }
};

migrate();
