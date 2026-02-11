const fs = require('fs');
const pool = require('./db');

const seedValues = async () => {
    try {
        const sql = fs.readFileSync('seed_schedules.sql', 'utf8');
        await pool.query(sql);
        console.log("Dados de teste inseridos com sucesso!");
        process.exit(0);
    } catch (err) {
        console.error("Erro ao inserir dados:", err.message);
        process.exit(1);
    }
};

seedValues();
