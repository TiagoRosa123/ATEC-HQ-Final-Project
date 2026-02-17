const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const verifyFormador = require('../middleware/verifyFormador');

//get
router.get('/', authorization, async (req, res) => {
    try {
        const evaluations = await pool.query("SELECT * FROM avaliacoes");
        res.json(evaluations.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//get by Class & Module
router.get('/by-class-module/:turmaId/:moduloId', authorization, async (req, res) => {
    try {
        const { turmaId, moduloId } = req.params;
        const evaluations = await pool.query(
            "SELECT * FROM avaliacoes WHERE turma_id = $1 AND modulo_id = $2",
            [turmaId, moduloId]
        );
        res.json(evaluations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, verifyFormador, async (req, res) => {
    try {
        const { turma_id, modulo_id, formando_id, nota, data_avaliacao, tipo_avaliacao, observacoes } = req.body;
        const newEvaluation = await pool.query("INSERT INTO avaliacoes (turma_id, modulo_id, formando_id, nota, data_avaliacao, tipo_avaliacao, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [turma_id, modulo_id, formando_id, nota, data_avaliacao, tipo_avaliacao, observacoes]);
        res.json(newEvaluation.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//put
router.put('/update/:id', authorization, verifyFormador, async (req, res) => {
    try {
        const { id } = req.params;
        const { turma_id, modulo_id, formando_id, nota, data_avaliacao, tipo_avaliacao, observacoes } = req.body;
        const updateEvaluation = await pool.query("UPDATE avaliacoes SET turma_id = $1, modulo_id = $2, formando_id = $3, nota = $4, data_avaliacao = $5, tipo_avaliacao = $6, observacoes = $7 WHERE id = $8 RETURNING *", [turma_id, modulo_id, formando_id, nota, data_avaliacao, tipo_avaliacao, observacoes, id]);
        res.json(updateEvaluation.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

// GET /my-grades (Para o aluno ver as suas notas)
router.get('/my-grades', authorization, async (req, res) => {
    try {
        // 1. Descobrir ID de formando
        const formando = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [req.user.id]);

        if (formando.rows.length === 0) {
            return res.status(404).json("Perfil de formando não encontrado.");
        }
        const formandoId = formando.rows[0].id;

        // 2. Buscar avaliações
        const query = `
            SELECT 
                a.id, 
                a.nota, 
                a.data_avaliacao, 
                a.tipo_avaliacao, 
                a.observacoes,
                m.nome as modulo_nome,
                m.codigo as modulo_codigo
            FROM avaliacoes a
            JOIN modulos m ON a.modulo_id = m.id
            WHERE a.formando_id = $1
            ORDER BY a.data_avaliacao DESC
        `;
        const grades = await pool.query(query, [formandoId]);
        res.json(grades.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro ao buscar notas.");
    }
});

module.exports = router;