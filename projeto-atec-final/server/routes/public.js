const router = require('express').Router();
const pool = require('../db');

// PUBLIC: Listar cursos para a Landing Page
router.get('/courses', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id, 
                c.nome, 
                c.descricao, 
                a.nome as area_nome, 
                c.imagem, 
                c.duracao_horas,
                (
                    SELECT MIN(t.data_inicio)
                    FROM turmas t
                    WHERE t.curso_id = c.id
                    AND t.data_inicio >= CURRENT_DATE
                ) as proxima_data_inicio
            FROM cursos c
            LEFT JOIN areas a ON c.area_id = a.id
            ORDER BY a.nome ASC, c.nome ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na rota /public/courses:", err.message);
        res.status(500).send(err.message); // Enviar mensagem para facilitar debug
    }
});

module.exports = router;
