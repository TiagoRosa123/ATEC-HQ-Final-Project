const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PdfPrinter = require('pdfmake/js/Printer').default;

//Config PDF - DEBUG MODE
let printer = null;
try {
    const fontPath = path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto');
    console.log("Tentando carregar fontes de:", fontPath);

    const fonts = {
        Roboto: {
            normal: path.join(fontPath, 'Roboto-Regular.ttf'),
            bold: path.join(fontPath, 'Roboto-Medium.ttf'),
            italics: path.join(fontPath, 'Roboto-Italic.ttf'),
            bolditalics: path.join(fontPath, 'Roboto-MediumItalic.ttf')
        }
    };
    printer = new PdfPrinter(fonts);
    console.log("Motor PDF iniciado com sucesso!");
} catch (error) {
    console.error("ERRO GRAVE AO INICIAR PDFPRINTER:", error.message);
}

// Configuração do Multer
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
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// LISTAR (Admin vê ficheiros de um user específico)
router.get('/admin/list/:userId', authorization, async (req, res) => {
    try {
        // 1. Verifica se quem pede é Admin
        const adminCheck = await pool.query("SELECT is_admin FROM utilizadores WHERE id = $1", [req.user.id]);
        if (!adminCheck.rows[0].is_admin) {
            return res.status(403).json("Acesso negado.");
        }

        const { userId } = req.params;

        // 2. Descobre se o alvo é formando ou formador
        const targetUser = await pool.query("SELECT role FROM utilizadores WHERE id = $1", [userId]);
        if (targetUser.rows.length === 0) return res.status(404).json("User não encontrado");

        const role = targetUser.rows[0].role;
        let files = [];

        if (role === 'formando') {
            const f = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [userId]);
            if (f.rows.length > 0) files = (await pool.query("SELECT * FROM ficheiros WHERE formando_id = $1", [f.rows[0].id])).rows;
        } else if (role === 'formador') {
            const f = await pool.query("SELECT id FROM formadores WHERE utilizador_id = $1", [userId]);
            if (f.rows.length > 0) files = (await pool.query("SELECT * FROM ficheiros WHERE formador_id = $1", [f.rows[0].id])).rows;
        }

        res.json(files);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

// UPLOAD (Admin envia para um user)
router.post('/admin/upload/:userId', authorization, upload.single('file'), async (req, res) => {
    try {
        // 1. Verifica Admin
        const adminCheck = await pool.query("SELECT is_admin FROM utilizadores WHERE id = $1", [req.user.id]);
        if (!adminCheck.rows[0].is_admin) return res.status(403).json("Acesso negado.");

        const { userId } = req.params;
        const { tipo_ficheiro } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: "Nenhum ficheiro enviado." });

        // 2. Descobre IDs internos do alvo
        let formingId = null;
        let teacherId = null;

        const targetUser = await pool.query("SELECT role FROM utilizadores WHERE id = $1", [userId]);
        const role = targetUser.rows[0]?.role;

        if (role === 'formando') {
            const f = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [userId]);
            formingId = f.rows[0]?.id;
        } else if (role === 'formador') {
            const f = await pool.query("SELECT id FROM formadores WHERE utilizador_id = $1", [userId]);
            teacherId = f.rows[0]?.id;
        }

        if (!formingId && !teacherId) return res.status(400).json({ message: "Utilizador destino inválido (não é aluno nem formador)." });

        // 3. Guarda na BD
        const newFile = await pool.query(
            "INSERT INTO ficheiros (formando_id, formador_id, nome_ficheiro, tipo_ficheiro, mime_type, tamanho_bytes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [formingId, teacherId, file.filename, tipo_ficheiro, file.mimetype, file.size]
        );

        res.json(newFile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no upload");
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

//PDF
router.get('/export-pdf', authorization, async (req, res) => {
    try {
        const formando_id = req.user.id;
        const dados = await pool.query(
            `SELECT 
                u.nome as nome, 
                u.foto_perfil as foto,
                u.email as email, 
                c.nome as curso, 
                m.nome as modulo, 
                a.nota, 
                a.tipo_avaliacao,
                a.data_avaliacao 
            FROM avaliacoes a
            JOIN formandos f ON a.formando_id = f.id
            JOIN utilizadores u ON f.utilizador_id = u.id
            JOIN modulos m ON a.modulo_id = m.id
            JOIN turmas t ON a.turma_id = t.id
            JOIN cursos c ON t.curso_id = c.id
            WHERE f.utilizador_id = $1`,
            [req.user.id]);

        //Corpo da tabela
        const corpoTabela = [
            ['Curso', 'Módulo', 'Avaliação', 'Tipo de Avaliação', 'Data']
        ];

        for (let i = 0; i < dados.rows.length; i++) {
            const linha = dados.rows[i];
            const dataFormatada = new Date(linha.data_avaliacao).toLocaleDateString('pt-PT');

            corpoTabela.push([
                linha.curso || "",
                linha.modulo || "",
                linha.nota ? linha.nota.toString() : "0",
                linha.tipo_avaliacao || "",
                dataFormatada
            ]);
        }

        if (dados.rows.length === 0) {
            return res.status(404).json("Não existem dados de avaliação para este aluno.");
        }

        //Para nao crachar caso nao haja foto
        // Imagem "cinzenta" básica em Base64 (Quadrado Cinza Visível)
        const placeholderBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

        let imagemPerfil = placeholderBase64;

        // Se houver foto e o ficheiro existir, usamos a foto do utilizador
        if (dados.rows[0].foto && fs.existsSync(dados.rows[0].foto)) {
            imagemPerfil = dados.rows[0].foto;
        } else if (dados.rows[0].foto && dados.rows[0].foto.startsWith('data:image')) {
            // Caso a foto já venha em base64 (pouco provável no teu setup atual, mas fica a salvaguarda)
            imagemPerfil = dados.rows[0].foto;
        }

        const docDefinition = {
            content: [
                { text: 'Ficha de Formando', style: 'header' },
                { image: imagemPerfil, width: 100, height: 100 },
                { text: `Nome: ${dados.rows[0].nome}` }, // Exemplo de ir buscar o nome ao primeiro resultado
                { text: '\n' }, // Espaço
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 'auto', 'auto', 'auto'], // Larguras das colunas
                        body: corpoTabela
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
            }
        };
        // Cria pdf e envia
        const pdfDoc = await printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Ficha_Formando.pdf');
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro");
    }
});

module.exports = router;
