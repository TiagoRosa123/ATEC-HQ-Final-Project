const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

//get
router.get('/', authorization, async (req, res) => {
    try {
        const classes = await pool.query("SELECT * FROM turmas");
        res.json(classes.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, async (req, res) => {

    try {
        const { codigo, curso_id, data_inicio, data_fim, estado } = req.body;
        const newClass = await pool.query("INSERT INTO turmas (codigo, curso_id, data_inicio, data_fim, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *", [codigo, curso_id, data_inicio, data_fim, estado]);
        res.json(newClass.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//put
router.put('/update/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, curso_id, data_inicio, data_fim, estado } = req.body;
        const updateClass = await pool.query("UPDATE turmas SET codigo = $1, curso_id = $2, data_inicio = $3, data_fim = $4, estado = $5 WHERE id = $6 RETURNING *", [codigo, curso_id, data_inicio, data_fim, estado, id]);
        res.json(updateClass.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//delete
router.delete('/delete/:id', authorization, async (req, res) => {
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

module.exports = router;