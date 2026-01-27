const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

//get
router.get('/', authorization, async (req, res) => {
    try {
        const rooms = await pool.query("SELECT * FROM salas");
        res.json(rooms.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, async (req, res) => {

    try {
        const { area_id, nome, capacidade, recursos } = req.body;
        const newRoom = await pool.query("INSERT INTO salas (area_id, nome, capacidade, recursos) VALUES ($1, $2, $3, $4) RETURNING *", [area_id, nome, capacidade, recursos]);
        res.json(newRoom.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//put
router.put('/update/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { area_id, nome, capacidade, recursos } = req.body;
        const updateRoom = await pool.query("UPDATE salas SET area_id = $1, nome = $2, capacidade = $3, recursos = $4 WHERE id = $5 RETURNING *", [area_id, nome, capacidade, recursos, id]);
        res.json(updateRoom.rows[0]);
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
        const deleteRoom = await pool.query("DELETE FROM salas WHERE id = $1 RETURNING *", [id]);
        res.json(deleteRoom.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

module.exports = router;