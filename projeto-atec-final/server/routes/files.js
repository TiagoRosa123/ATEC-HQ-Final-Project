const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar onde guardar os ficheiros
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Cria a pasta se não existir
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Guarda como: nomeoriginal-data.pdf
        cb(null, file.originalname + '-' + Date.now());
    }
});
const upload = multer({ storage: storage });
// POST - Upload de Ficheiro
router.post('/upload', authorization, upload.single('file'), async (req, res) => {
    try {
        const { tipo_ficheiro } = req.body;
        const file = req.file;
        if (!file) return res.status(400).send('Nenhum ficheiro enviado.');

        // Primeiro descobrimos quem é o user (se é formando, formador, etc)
        const userQuery = await pool.query("SELECT * FROM utilizadores WHERE id = $1", [req.user.id]);
        const userRole = userQuery.rows[0].role; // 'formando', 'formador', etc.
        
        //buscamos o ID específico na tabela certa
        let formingId = null;
        let teacherId = null;
        
        if(userRole === 'formando') {
             const f = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [req.user.id]);
             formingId = f.rows[0]?.id;
        } else if (userRole === 'formador') {
             const f = await pool.query("SELECT id FROM formadores WHERE utilizador_id = $1", [req.user.id]);
             teacherId = f.rows[0]?.id;
        }
        const newFile = await pool.query(
            "INSERT INTO ficheiros (formando_id, formador_id, nome_ficheiro, tipo_ficheiro, mime_type, tamanho_bytes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [formingId, teacherId, file.filename, tipo_ficheiro, file.mimetype, file.size]
        );
        res.json(newFile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});
module.exports = router;