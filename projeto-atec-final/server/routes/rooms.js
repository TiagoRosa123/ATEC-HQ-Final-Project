const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const verifyAdmin = require('../middleware/verifyAdmin');

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

//get salas disponiveis
router.get('/available', authorization, async (req, res) => {
    try {
        const rooms = await pool.query("SELECT * FROM salas WHERE estado = 'disponivel'");
        res.json(rooms.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, verifyAdmin, async (req, res) => {

    try {
        const { area_id, nome, capacidade, recursos, estado } = req.body;
        // Default para 'disponivel' se não vier nada
        const statusFinal = estado || 'disponivel';

        const newRoom = await pool.query("INSERT INTO salas (area_id, nome, capacidade, recursos, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *", [area_id, nome, capacidade, recursos, statusFinal]);
        res.json(newRoom.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//put
router.put('/update/:id', authorization, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { area_id, nome, capacidade, recursos, estado } = req.body;

        const updateRoom = await pool.query("UPDATE salas SET area_id = $1, nome = $2, capacidade = $3, recursos = $4, estado = $5 WHERE id = $6 RETURNING *", [area_id, nome, capacidade, recursos, estado, id]);
        res.json(updateRoom.rows[0]);
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
        const deleteRoom = await pool.query("DELETE FROM salas WHERE id = $1 RETURNING *", [id]);
        res.json(deleteRoom.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

module.exports = router;