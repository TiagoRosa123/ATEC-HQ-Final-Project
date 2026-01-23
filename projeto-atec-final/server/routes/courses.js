const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

//get
router.get('/', authorization, async (req, res) => {
    try {
        const courses = await pool.query("SELECT * FROM cursos");
        res.json(courses.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, async (req, res) => {
    try {
        const { nome, sigla, descricao, area_id } = req.body;
        const newCourse = await pool.query("INSERT INTO cursos (nome, sigla, descricao, area_id) VALUES ($1, $2, $3, $4) RETURNING *", [nome, sigla, descricao, area_id]);
        res.json(newCourse.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//put
router.put('/update/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, sigla, descricao, area_id } = req.body;
        const updateCourse = await pool.query("UPDATE cursos SET nome = $1, sigla = $2, descricao = $3, area_id = $4 WHERE id = $5 RETURNING *", [nome, sigla, descricao, area_id, id]);
        res.json(updateCourse.rows[0]);
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
        const deleteCourse = await pool.query("DELETE FROM cursos WHERE id = $1 RETURNING *", [id]);
        res.json(deleteCourse.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});


module.exports = router;