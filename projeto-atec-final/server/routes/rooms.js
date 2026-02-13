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

// RESERVAR SALA
router.post('/reserve', authorization, async (req, res) => {
    try {
        const { sala_id, data_inicio, data_fim, motivo } = req.body;
        // req.user.id vem do middleware authorization
        const formador_id = req.user.id;

        // Verificar sobreposição (Query complexa com TSRANGE ou verificação manual)
        // Usamos a CONSTRAINT no DB (no schema novo), então o INSERT falha se houver overlap
        // Mas podemos checkar antes para mensagem amigável

        const newReservation = await pool.query(
            "INSERT INTO reservas_salas (sala_id, formador_id, data_inicio, data_fim, motivo) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [sala_id, formador_id, data_inicio, data_fim, motivo]
        );

        res.json(newReservation.rows[0]);

    } catch (err) {
        console.error(err.message);
        if (err.constraint === 'no_overlap') {
            return res.status(409).json("Sala já ocupada nesse horário.");
        }
        res.status(500).send("Erro no servidor");
    }
});

//post
router.post('/create', authorization, async (req, res) => {

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
router.put('/update/:id', authorization, async (req, res) => {
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