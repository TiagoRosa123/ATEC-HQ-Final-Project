const { Client } = require('pg');
require('dotenv').config();

async function checkUserInATECHQ() {
    const client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'ATEC_HQ' // Vamos espreitar a outra BD
    });

    try {
        await client.connect();
        console.log("Ligado à BD: ATEC_HQ");

        const res = await client.query("SELECT * FROM utilizadores WHERE email LIKE '%hugo%'");
        if (res.rows.length > 0) {
            console.log("✅ ENCONTREI O HUGO AQUI!");
            console.log(res.rows[0]);
        } else {
            console.log("❌ O Hugo não está nesta BD também.");
        }

    } catch (err) {
        console.error("Erro ao conectar à ATEC_HQ:", err.message);
    } finally {
        client.end();
    }
}

checkUserInATECHQ();
