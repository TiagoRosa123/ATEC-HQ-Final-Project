const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

router.get('/stats', authorization, async (req, res) => {
    try {
        // Admin ou Secretária podem ver estatísticas globais
        const userCheck = await pool.query("SELECT is_admin, role FROM utilizadores WHERE id = $1", [req.user.id]);
        const { is_admin, role } = userCheck.rows[0];
        if (!is_admin && role !== 'secretaria') {
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

// Stats para Formador - turmas, próximas aulas, alunos
router.get('/stats/formador', authorization, async (req, res) => {
    try {
        // Verificar se é formador
        const formadorCheck = await pool.query(
            "SELECT f.id FROM formadores f WHERE f.utilizador_id = $1", [req.user.id]
        );
        if (formadorCheck.rows.length === 0) {
            return res.status(403).json("Acesso negado. Apenas para formadores.");
        }
        const formadorId = formadorCheck.rows[0].id;

        // Próximas 5 aulas agendadas
        const proximasAulas = await pool.query(`
            SELECT h.data, h.hora_inicio, h.hora_fim, 
                   m.nome as modulo, t.codigo as turma, s.nome as sala
            FROM horarios h
            JOIN modulos m ON h.modulo_id = m.id
            JOIN turmas t ON h.turma_id = t.id
            LEFT JOIN salas s ON h.sala_id = s.id
            WHERE h.formador_id = $1 AND h.data >= CURRENT_DATE
            ORDER BY h.data, h.hora_inicio
            LIMIT 5
        `, [formadorId]);

        // Total de turmas ativas do formador
        const turmasAtivas = await pool.query(`
            SELECT COUNT(DISTINCT h.turma_id)
            FROM horarios h
            JOIN turmas t ON h.turma_id = t.id
            WHERE h.formador_id = $1 AND t.estado = 'ativa'
        `, [formadorId]);

        // Total de aulas esta semana
        const aulasEstaSemana = await pool.query(`
            SELECT COUNT(*)
            FROM horarios h
            WHERE h.formador_id = $1 
              AND h.data >= date_trunc('week', CURRENT_DATE)
              AND h.data < date_trunc('week', CURRENT_DATE) + interval '7 days'
        `, [formadorId]);

        // Total de alunos únicos nas turmas do formador
        const totalAlunos = await pool.query(`
            SELECT COUNT(DISTINCT i.formando_id)
            FROM inscricoes i
            JOIN turmas t ON i.turma_id = t.id
            JOIN horarios h ON h.turma_id = t.id
            WHERE h.formador_id = $1 AND t.estado = 'ativa'
        `, [formadorId]);

        res.json({
            proximasAulas: proximasAulas.rows,
            turmasAtivas: parseInt(turmasAtivas.rows[0].count),
            aulasEstaSemana: parseInt(aulasEstaSemana.rows[0].count),
            totalAlunos: parseInt(totalAlunos.rows[0].count)
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
