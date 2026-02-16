const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbName = process.env.DB_NAME;

async function createDatabase() {
    const client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'postgres' // Connect to default db to create new one
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (res.rowCount === 0) {
            console.log(`Creating database ${dbName}...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log("Database created!");
        } else {
            console.log("Database already exists.");
        }
    } catch (err) {
        console.error("Error creating database:", err);
    } finally {
        await client.end();
    }
}

async function runSqlFile(filename, pool) {
    const filePath = path.join(__dirname, filename);
    console.log(`Running ${filename}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`${filename} executed successfully.`);
}

async function init() {
    await createDatabase();

    const { Pool } = require('pg');
    const pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: dbName,
    });

    try {
        await runSqlFile('database.sql', pool);
        await runSqlFile('seed_schedules.sql', pool);
        console.log("Initialization complete!");
    } catch (err) {
        console.error("Error during initialization:", err);
    } finally {
        await pool.end();
    }
}

init();
