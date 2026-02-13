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

        // 1. Totais Detalhados
        // Total de cursos (Turmas) terminados
        const finishedCourses = await pool.query("SELECT COUNT(*) FROM turmas WHERE estado = 'concluida'");

        // Total de cursos (Turmas) a decorrer
        const activeCourses = await pool.query("SELECT COUNT(*) FROM turmas WHERE estado = 'ativa'");

        // Total de formandos a frequentar (inscricoes ativas)
        const activeTrainees = await pool.query("SELECT COUNT(*) FROM inscricoes WHERE estado = 'ativa'");

        const totalTrainers = await pool.query("SELECT COUNT(*) FROM formadores");

        // 2. Cursos por Área (Pie Chart)
        const coursesByArea = await pool.query(`
            SELECT a.nome as nome, COUNT(c.id) as valor 
            FROM cursos c
            JOIN areas a ON c.area_id = a.id
            GROUP BY a.nome
        `);

        // 3. Top 10 Formadores com mais aulas agendadas (Bar Chart)
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
                cursosConcluidos: parseInt(finishedCourses.rows[0].count),
                cursosDecorrer: parseInt(activeCourses.rows[0].count),
                formandosAtivos: parseInt(activeTrainees.rows[0].count),
                formadores: parseInt(totalTrainers.rows[0].count)
            },
            cursosPorArea: coursesByArea.rows.map(row => ({ ...row, valor: parseInt(row.valor) })),
            topFormadores: topTrainers.rows.map(row => ({ ...row, aulas: parseInt(row.aulas) }))
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

// ROTA: Listar Formandos (Protegida)
router.get('/students', authorization, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.id, f.nome, u.email 
            FROM formandos f
            JOIN utilizadores u ON f.utilizador_id = u.id
            ORDER BY f.nome ASC
        `);
        res.json(result.rows);

    } catch (err) {
        console.error("Erro /dashboard/students:", err.message);
        res.status(500).send("Erro no servidor");
    }

});

// ROTA: Listar Formandos agrupados por turma (Para Mobile)
router.get('/students-by-class', authorization, async (req, res) => {
    try {
        // Buscar formandos c/ inscrição ativa + código da turma
        const query = `
            SELECT 
                t.codigo as turma_codigo,
                t.id as turma_id,
                f.id as formando_id,
                f.nome as formando_nome,
                u.email as formando_email
            FROM inscricoes i
            JOIN turmas t ON i.turma_id = t.id
            JOIN formandos f ON i.formando_id = f.id
            JOIN utilizadores u ON f.utilizador_id = u.id
            WHERE i.estado = 'ativa' AND t.estado = 'ativa'
            ORDER BY t.codigo ASC, f.nome ASC
        `;

        const result = await pool.query(query);

        // Agrupar por Turma no Backend (ou enviar flat e agrupar no Android)
        // Vamos enviar agrupado para facilitar
        const grouped = {};

        result.rows.forEach(row => {
            if (!grouped[row.turma_codigo]) {
                grouped[row.turma_codigo] = [];
            }
            grouped[row.turma_codigo].push({
                id: row.formando_id,
                nome: row.formando_nome,
                email: row.formando_email
            });
        });

        // Converter para array para o Android
        // Formato: [ { turma: "TPSI 1024", students: [...] }, ... ]
        const response = Object.keys(grouped).map(key => ({
            turma: key,
            students: grouped[key]
        }));

        res.json(response);

    } catch (err) {
        console.error("Erro /dashboard/students-by-class:", err.message);
        res.status(500).send("Erro no servidor");
    }
});

// ROTA: Listar Formadores (Protegida)
router.get('/teachers', authorization, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.id, f.nome, u.email 
            FROM formadores f
            JOIN utilizadores u ON f.utilizador_id = u.id
            ORDER BY f.nome ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro /dashboard/teachers:", err.message);
        res.status(500).send("Erro no servidor");
    }
});

module.exports = router;
