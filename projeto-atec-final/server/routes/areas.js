const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

//get
router.get('/', authorization, async (req, res) => {
    try {
        const areas = await pool.query("SELECT * FROM areas");
        res.json(areas.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, async (req, res) => {

    try {
        const { nome, descricao } = req.body;
        //VERIFICAÇÃO de area duplicada
        const check = await pool.query("SELECT * FROM areas WHERE LOWER(nome) = LOWER($1)", [nome]);
        if (check.rows.length > 0) {
            return res.status(400).json("Essa Área já existe!");
        }
        // Se não existir, criar
        const newArea = await pool.query("INSERT INTO areas (nome, descricao) VALUES ($1, $2) RETURNING *", [nome, descricao]);
        res.json(newArea.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//put
router.put('/update/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;
        const updateArea = await pool.query("UPDATE areas SET nome = $1, descricao = $2 WHERE id = $3 RETURNING *", [nome, descricao, id]);
        res.json(updateArea.rows[0]);
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
        const deleteArea = await pool.query("DELETE FROM areas WHERE id = $1 RETURNING *", [id]);
        res.json(deleteArea.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});


module.exports = router;