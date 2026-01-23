const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

//get
router.get('/', authorization, async (req, res) => {
    try {
        const modules = await pool.query("SELECT * FROM modulos");
        res.json(modules.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, async (req, res) => {
    try {
        const { nome, horas_totais, codigo } = req.body;
        const newModule = await pool.query("INSERT INTO modulos (nome, horas_totais, codigo) VALUES ($1, $2, $3) RETURNING *", [nome, horas_totais, codigo]);
        res.json(newModule.rows[0]);
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
        const { nome, horas_totais, codigo } = req.body;
        const updateModule = await pool.query("UPDATE modulos SET nome = $1, horas_totais = $2, codigo = $3 WHERE id = $4 RETURNING *", [nome, horas_totais, codigo, id]);
        res.json(updateModule.rows[0]);
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
        const deleteModule = await pool.query("DELETE FROM modulos WHERE id = $1 RETURNING *", [id]);
        res.json(deleteModule.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});


module.exports = router;