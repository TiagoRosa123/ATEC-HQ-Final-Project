const router = require('express').Router();
const pool = require('../db');
const multer = require('multer');
const fs = require('fs');

// 1. Configurar upload para pasta 'uploads/candidaturas'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/candidaturas';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-CV-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Rota para listar Cursos (Pública - para o dropdown)
router.get('/courses', async (req, res) => {
    try {
        const allCourses = await pool.query("SELECT * FROM cursos ORDER BY nome ASC");
        res.json(allCourses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro ao buscar cursos");
    }
});

// 2. Rota POST Pública para enviar candidatura
router.post('/apply', upload.single('file'), async (req, res) => {
    try {
        const { nome, observacao, curso_id } = req.body;
        const file = req.file;

        await pool.query(
            "INSERT INTO candidaturas (nome, curso_id, observacao, cv_filename) VALUES ($1, $2, $3, $4)",
            [nome, curso_id, observacao, file ? file.filename : null]
        );

        res.json({ msg: "Candidatura enviada!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro ao processar candidatura");
    }
});

module.exports = router;
