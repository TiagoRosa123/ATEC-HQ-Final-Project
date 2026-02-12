const pool = require('./db');
const bcrypt = require('bcrypt');

async function fixPassword() {
    try {
        const password = '123456';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        console.log(`Nova Hash Gerada para '${password}': ${hash}`);

        const res = await pool.query(
            "UPDATE utilizadores SET password_hash = $1 WHERE email = 'tiago.formador@atec.pt' RETURNING id, email",
            [hash]
        );

        if (res.rowCount > 0) {
            console.log(`Sucesso! Password atualizada para o user: ${res.rows[0].email}`);
        } else {
            console.log("Erro: User 'tiago.formador@atec.pt' não encontrado.");
        }
    } catch (err) {
        console.error("Erro:", err);
    } finally {
        pool.end();
    }
}

fixPassword();
