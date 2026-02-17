const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const verifyAdmin = require('../middleware/verifyAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer (Igual ao files.js)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Prevenir sobreposição com timestamp
        cb(null, 'course-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

//get public (LIVRE DE TOKEN)
router.get('/public', async (req, res) => {
    try {
        const query = `
            SELECT c.*, a.nome as area_nome,
            (
                SELECT MIN(t.data_inicio)
                FROM turmas t
                WHERE t.curso_id = c.id
                AND t.data_inicio >= CURRENT_DATE
                AND t.estado != 'cancelada'
            ) as proxima_data_inicio
            FROM cursos c
            LEFT JOIN areas a ON c.area_id = a.id
            ORDER BY c.nome ASC
        `;
        const courses = await pool.query(query);
        res.json(courses.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

// GET active/running courses (with active classes)
router.get('/running', authorization, async (req, res) => {
    try {
        // Seleciona cursos que tem pelo menos uma turma com estado 'ativa'
        const query = `
            SELECT DISTINCT c.* 
            FROM cursos c
            JOIN turmas t ON c.id = t.curso_id
            WHERE t.estado = 'ativa'
            ORDER BY c.nome ASC
        `;
        const courses = await pool.query(query);
        res.json(courses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

//get protected
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
//post
router.post('/create', authorization, verifyAdmin, upload.single('file'), async (req, res) => {
    try {
        const { nome, sigla, descricao, area_id, duracao_horas } = req.body;
        let imagem = req.body.imagem; // Caso venha URL manual (fallback)

        if (req.file) {
            // Se veio ficheiro, construímos o URL
            const protocol = req.protocol;
            const host = req.get('host');
            imagem = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        const newCourse = await pool.query(
            "INSERT INTO cursos (nome, sigla, descricao, area_id, imagem, duracao_horas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [nome, sigla, descricao, area_id, imagem, duracao_horas]
        );
        res.json(newCourse.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//put
//put
router.put('/update/:id', authorization, verifyAdmin, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, sigla, descricao, area_id, duracao_horas } = req.body;
        let imagem = req.body.imagem; // URL antiga ou nova manual

        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            imagem = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        // Se não houver nova imagem (nem file nem string), mantemos a antiga na query?
        // A query SQL faz update de TUDO. Se imagem for undefined, vai dar asneira ou NULL.
        // O frontend deve enviar a imagem antiga se não mudou, ou lidamos com isso aqui.
        // Simplificação: O frontend envia sempre os dados todos. Se mudou imagem, envia ficheiro.
        // Se nao mudou, envia a string que ja la estava.

        // Pequena proteção: se imagem for undefined e não houver file, se calhar não devíamos fazer update a esse campo?
        // Mas o SQL em baixo espera 6 argumentos. Vamos assumir que o frontend envia o URL antigo em 'imagem' se nao fizer upload.

        const updateCourse = await pool.query(
            "UPDATE cursos SET nome = $1, sigla = $2, descricao = $3, area_id = $4, imagem = $5, duracao_horas = $6 WHERE id = $7 RETURNING *",
            [nome, sigla, descricao, area_id, imagem, duracao_horas, id]
        );
        res.json(updateCourse.rows[0]);
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
        const deleteCourse = await pool.query("DELETE FROM cursos WHERE id = $1 RETURNING *", [id]);
        res.json(deleteCourse.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});


//associaçao c/ modulos
//get
router.get('/:id/modules', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const modules = await pool.query("SELECT modulos.* FROM modulos JOIN curso_modulos ON modulos.id = curso_modulos.modulo_id WHERE curso_modulos.curso_id = $1", [id]);
        res.json(modules.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//post
router.post('/:id/modules', authorization, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { modulo_id } = req.body;
        const newModule = await pool.query("INSERT INTO curso_modulos (curso_id, modulo_id) VALUES ($1, $2) RETURNING *", [id, modulo_id]);
        res.json(newModule.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

//delete
router.delete('/:id/modules/:modulo_id', authorization, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { modulo_id } = req.params;
        const deleteModule = await pool.query("DELETE FROM curso_modulos WHERE curso_id = $1 AND modulo_id = $2 RETURNING *", [id, modulo_id]);
        res.json(deleteModule.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor")
    }
});

module.exports = router;