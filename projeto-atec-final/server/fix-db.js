const pool = require('./db');

async function insertArea() {
    try {
        const res = await pool.query("INSERT INTO areas (nome, descricao) VALUES ('Informática', 'Cursos de Tecnologias de Informação') RETURNING *");
        console.log('Area Criada:', res.rows[0]);
        pool.end();
    } catch (err) {
        console.error(err.message);
    }
}

insertArea();
