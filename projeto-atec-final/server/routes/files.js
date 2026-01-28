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
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Guarda como: data-nomeoriginal.pdf
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// POST - Upload de Ficheiro
router.post('/upload', authorization, upload.single('file'), async (req, res) => {
    try {
        const { tipo_ficheiro } = req.body;
        const file = req.file;

        if (!file) return res.status(400).send('Nenhum ficheiro enviado.');

        // Vamos assumir que é o próprio utilizador a enviar o seu ficheiro
        // Primeiro descobrimos quem é o user (se é formando, formador, etc)
        const userQuery = await pool.query("SELECT * FROM utilizadores WHERE id = $1", [req.user.id]);
        const userRole = userQuery.rows[0].role; // 'formando', 'formador', etc.

        // Agora buscamos o ID específico na tabela certa
        let formingId = null;
        let teacherId = null;

        if (userRole === 'formando') {
            const f = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [req.user.id]);
            formingId = f.rows[0]?.id;
        } else if (userRole === 'formador') {
            const f = await pool.query("SELECT id FROM formadores WHERE utilizador_id = $1", [req.user.id]);
            teacherId = f.rows[0]?.id;
        }

        if (!formingId && !teacherId) {
            return res.status(400).json({ message: "O teu utilizador não tem perfil de Aluno nem Formador associado." });
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

// LISTAR os meus ficheiros
router.get('/my-files', authorization, async (req, res) => {
    try {
        const userQuery = await pool.query("SELECT * FROM utilizadores WHERE id = $1", [req.user.id]);
        const userRole = userQuery.rows[0].role;

        let files = [];
        if (userRole === 'formando') {
            const f = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [req.user.id]);
            if (f.rows.length > 0) {
                const result = await pool.query("SELECT * FROM ficheiros WHERE formando_id = $1", [f.rows[0].id]);
                files = result.rows;
            }
        } else if (userRole === 'formador') {
            const f = await pool.query("SELECT id FROM formadores WHERE utilizador_id = $1", [req.user.id]);
            if (f.rows.length > 0) {
                const result = await pool.query("SELECT * FROM ficheiros WHERE formador_id = $1", [f.rows[0].id]);
                files = result.rows;
            }
        }
        res.json(files);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

// DOWNLOAD Ficheiro
router.get('/download/:filename', authorization, async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads', filename);

        if (fs.existsSync(filePath)) {
            res.download(filePath); // Envia o ficheiro para o browser (Download)
        } else {
            res.status(404).json("Ficheiro não encontrado");
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro");
    }
});

module.exports = router;
