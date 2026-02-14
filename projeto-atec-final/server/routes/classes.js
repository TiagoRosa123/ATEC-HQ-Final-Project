const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const verifyAdmin = require('../middleware/verifyAdmin');

//get
//get all classes with names
router.get('/', authorization, async (req, res) => {
    try {
        const query = `
            SELECT t.*, c.nome as curso_nome, f.nome as coordenador_nome 
            FROM turmas t 
            LEFT JOIN cursos c ON t.curso_id = c.id 
            LEFT JOIN formadores f ON t.coordenador_id = f.id
            ORDER BY t.data_inicio DESC
        `;
        const classes = await pool.query(query);
        res.json(classes.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, verifyAdmin, async (req, res) => {
    try {
        const { codigo, curso_id, data_inicio, data_fim, estado, coordenador_id } = req.body;

        // Validation: Coordinator max 3 active classes
        if (coordenador_id && estado === 'ativa') {
            const activeClasses = await pool.query(
                "SELECT COUNT(*) FROM turmas WHERE coordenador_id = $1 AND estado = 'ativa'",
                [coordenador_id]
            );
            if (parseInt(activeClasses.rows[0].count) >= 3) {
                return res.status(400).json("O formador já se encontra a coordenar 3 turmas ativas.");
            }
        }

        const newClass = await pool.query(
            "INSERT INTO turmas (codigo, curso_id, data_inicio, data_fim, estado, coordenador_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [codigo, curso_id, data_inicio, data_fim, estado, coordenador_id]
        );
        res.json(newClass.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//put
router.put('/update/:id', authorization, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, curso_id, data_inicio, data_fim, estado, coordenador_id } = req.body;

        // Validation: Coordinator max 3 active classes
        if (coordenador_id && estado === 'ativa') {
            const activeClasses = await pool.query(
                "SELECT COUNT(*) FROM turmas WHERE coordenador_id = $1 AND estado = 'ativa' AND id != $2",
                [coordenador_id, id]
            );
            if (parseInt(activeClasses.rows[0].count) >= 3) {
                return res.status(400).json("O formador já se encontra a coordenar 3 turmas ativas.");
            }
        }

        const updateClass = await pool.query(
            "UPDATE turmas SET codigo = $1, curso_id = $2, data_inicio = $3, data_fim = $4, estado = $5, coordenador_id = $6 WHERE id = $7 RETURNING *",
            [codigo, curso_id, data_inicio, data_fim, estado, coordenador_id, id]
        );
        res.json(updateClass.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//delete
router.delete('/delete/:id', authorization, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteClass = await pool.query("DELETE FROM turmas WHERE id = $1 RETURNING *", [id]);
        res.json(deleteClass.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});


//inscricoes (depende da turma)
//get
router.get('/:id/students', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const students = await pool.query("SELECT form.id as formando_id, util.nome, util.email FROM inscricoes JOIN formandos form ON inscricoes.formando_id = form.id JOIN utilizadores util ON form.utilizador_id = util.id WHERE inscricoes.turma_id = $1", [id]);
        res.json(students.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/:id/students', authorization, verifyAdmin, async (req, res) => {

    try {
        const { id } = req.params;
        const { formando_id } = req.body;
        const newStudent = await pool.query("INSERT INTO inscricoes (turma_id, formando_id) VALUES ($1, $2) RETURNING *", [id, formando_id]);
        res.json(newStudent.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//delete
router.delete('/:id/students/:formando_id', authorization, verifyAdmin, async (req, res) => {
    try {
        const { id, formando_id } = req.params;
        const deleteStudent = await pool.query("DELETE FROM inscricoes WHERE turma_id = $1 AND formando_id = $2 RETURNING *", [id, formando_id]);
        res.json(deleteStudent.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//get - listar todos os formandos (para dropdown de inscrição)
router.get('/formandos', authorization, async (req, res) => {
    try {
        const formandos = await pool.query(
            "SELECT f.id, u.nome, u.email FROM formandos f JOIN utilizadores u ON f.utilizador_id = u.id ORDER BY u.nome ASC"
        );
        res.json(formandos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//get - listar todos os formadores (para dropdown de coordenador)
router.get('/formadores', authorization, async (req, res) => {
    try {
        // Formadores table already has the name
        const formadores = await pool.query("SELECT id, nome FROM formadores ORDER BY nome ASC");
        res.json(formadores.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

module.exports = router;