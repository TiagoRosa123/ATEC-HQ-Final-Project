const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PdfPrinter = require('pdfmake');

//Config PDF - DEBUG MODE
let printer = null;
try {
    const fontPath = path.join(__dirname, '../node_modules/pdfmake/fonts/Roboto');
    console.log("Fontes do pdf OK");

    const fonts = {
        Roboto: {
            normal: path.join(fontPath, 'Roboto-Regular.ttf'),
            bold: path.join(fontPath, 'Roboto-Medium.ttf'),
            italics: path.join(fontPath, 'Roboto-Italic.ttf'),
            bolditalics: path.join(fontPath, 'Roboto-MediumItalic.ttf')
        }
    };
    printer = new PdfPrinter(fonts);
    console.log("PDFmaker a funcionar");
} catch (error) {
    console.error("ERRO AO INICIAR PDFMAKER:", error.message);
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
const exportPdfHandler = async (req, res) => {
    try {
        let targetId = req.user.id; 
        console.log("Exportar PDF - Start. UserID original:", req.user.id);

        if (req.params.userId) {
            console.log("Param userID detetado:", req.params.userId);
            const adminCheck = await pool.query("SELECT is_admin FROM utilizadores WHERE id = $1", [req.user.id]);
            if (adminCheck.rows[0].is_admin) {
                targetId = req.params.userId;
            }
        }
        console.log("Target ID:", targetId);

        const dadosRole = await pool.query(`SELECT role FROM utilizadores WHERE id = $1`, [targetId]);
        const userName = await pool.query(`SELECT nome FROM utilizadores WHERE id = $1`, [targetId]);
        
        console.log("User encontrado:", userName.rows.length > 0 ? userName.rows[0].nome : "NÃO");
        
        if (dadosRole.rows.length === 0) return res.status(404).json("Utilizador não encontrado");
        
        const role = dadosRole.rows[0].role;
        console.log("Role:", role);
        let dados = null;
        let corpoTabela = [];
        let colunasLarguras = [];

        if (role === 'formando') {

            dados = await pool.query(
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
                [targetId]);

            //Corpo da tabela
            corpoTabela = [
                ['Curso', 'Módulo', 'Avaliação', 'Tipo de Avaliação', 'Data']
            ];
            colunasLarguras = ['*', '*', 'auto', 'auto', 'auto'];

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
                 // Mesmo sem dados, queremos gerar o PDF com o cabeçalho/foto
                 // Mas a tabela fica vazia ou com msg
                 corpoTabela.push([{ text: 'Sem registo de avaliações.', colSpan: 5, alignment: 'center' }, {}, {}, {}, {}]);
            }

        } else {

            dados = await pool.query(
                `SELECT DISTINCT
                    u.nome as nome, 
                    u.foto_perfil as foto,
                    c.nome as curso, 
                    t.codigo as turma,
                    m.nome as modulo
                FROM horarios h
                JOIN formadores f ON h.formador_id = f.id
                JOIN utilizadores u ON f.utilizador_id = u.id
                JOIN turmas t ON h.turma_id = t.id
                JOIN cursos c ON t.curso_id = c.id
                JOIN modulos m ON h.modulo_id = m.id
                WHERE u.id = $1`,
                [targetId]);

            //Corpo da tabela
            corpoTabela = [
                ['Curso', 'Turma', 'Módulo']
            ];
            colunasLarguras = ['*', 'auto', '*'];

            for (let i = 0; i < dados.rows.length; i++) {
                const linha = dados.rows[i];

                corpoTabela.push([
                    linha.curso || "",
                    linha.turma || "",
                    linha.modulo || ""
                ]);
            }

            if (dados.rows.length === 0) {
                 corpoTabela.push([{ text: 'Sem registo de aulas.', colSpan: 3, alignment: 'center' }, {}, {}]);
            }
        }

        //Para nao crachar caso nao haja foto
        // Imagem básica em Base64 
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
                { text: `Ficha de ${userName.rows[0].nome}`, style: 'header' },
                { image: imagemPerfil, width: 100, height: 100 },
                { text: '\n' }, // Espaço
                {
                    table: {
                        headerRows: 1,
                        widths: colunasLarguras, // Larguras das colunas
                        body: corpoTabela
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
            }
        };
        if (!printer) {
            return res.status(500).send("Erro: PDF Printer não foi iniciada. Verifique as fontes.");
        }

        // Cria pdf e envia
        const pdfDoc = await printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');

        // Para não haver risco de cortar o nome em alguns browsers
        const safeName = userName.rows[0].nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        res.setHeader('Content-Disposition', `attachment; filename="Ficha_${safeName}.pdf"`);

        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error("ERRO CRÍTICO PDF EXPORT:", err);
        // Enviar o erro exato para o frontend para conseguirmos ver no Network tab ou Toast
        res.status(500).send("Msg Servidor: " + err.message);
    }
};

router.get('/export-pdf', authorization, exportPdfHandler);
router.get('/export-pdf/:userId', authorization, exportPdfHandler);

module.exports = router;
