const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

router.get('/stats', authorization, async (req, res) => {
    try {
        // Apenas admin pode ver estatísticas globais? Para já sim.
        // Se quiseres abrir a formadores, remove esta verificação.
        const adminCheck = await pool.query("SELECT is_admin FROM utilizadores WHERE id = $1", [req.user.id]);
        if (!adminCheck.rows[0].is_admin) {
             return res.status(403).json("Acesso negado.");
        }

        // 1. Totais
        const totalCourses = await pool.query("SELECT COUNT(*) FROM cursos");
        const totalTrainees = await pool.query("SELECT COUNT(*) FROM formandos");
        const totalTrainers = await pool.query("SELECT COUNT(*) FROM formadores");

        // 2. Cursos por Área (Pie Chart)
        const coursesByArea = await pool.query(`
            SELECT a.nome as nome, COUNT(c.id) as valor 
            FROM cursos c
            JOIN areas a ON c.area_id = a.id
            GROUP BY a.nome
        `);

        // 3. Top 10 Formadores com mais aulas agendadas (Bar Chart)
        // Conta quantas entradas na tabela horarios cada formador tem
        const topTrainers = await pool.query(`
            SELECT f.nome as nome, COUNT(h.id) as aulas
            FROM horarios h
            JOIN formadores f ON h.formador_id = f.id
            GROUP BY f.nome
            ORDER BY aulas DESC
            LIMIT 10
        `);

        res.json({
            totais: {
                cursos: parseInt(totalCourses.rows[0].count),
                formandos: parseInt(totalTrainees.rows[0].count),
                formadores: parseInt(totalTrainers.rows[0].count)
            },
            cursosPorArea: coursesByArea.rows.map(row => ({...row, valor: parseInt(row.valor)})),
            topFormadores: topTrainers.rows.map(row => ({...row, aulas: parseInt(row.aulas)}))
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

module.exports = router;
