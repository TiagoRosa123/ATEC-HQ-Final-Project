const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// 1. Criar imagem dummy
const dummyImagePath = path.join(__dirname, 'test_course_image.jpg');
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
fs.writeFileSync(dummyImagePath, Buffer.from(base64Image, 'base64'));

async function testCourseUpload() {
    try {
        console.log("0. Procurar um admin...");
        const adminRes = await pool.query("SELECT email FROM utilizadores WHERE is_admin = true LIMIT 1");
        if (adminRes.rows.length === 0) throw new Error("Sem admins na BD");
        const adminEmail = adminRes.rows[0].email;
        console.log("Admin encontrado:", adminEmail);

        console.log("1. Autenticar como Admin...");
        const loginRes = await axios.post('http://localhost:5000/auth/login', {
            email: adminEmail,
            password: '123'
        });
        const token = loginRes.data.token;
        console.log("Login OK.");

        console.log("2. Upload de Curso com Imagem...");
        const form = new FormData();
        form.append('nome', 'Curso Teste Upload');
        form.append('sigla', 'CTU');
        form.append('descricao', 'Descrição teste');
        // Precisamos de um area_id válido.
        const areaRes = await pool.query("SELECT id FROM areas LIMIT 1");
        if (areaRes.rows.length === 0) throw new Error("Sem areas na BD");
        form.append('area_id', areaRes.rows[0].id);
        form.append('duracao_horas', 100);
        form.append('file', fs.createReadStream(dummyImagePath));

        const createRes = await axios.post('http://localhost:5000/courses/create', form, {
            headers: {
                ...form.getHeaders(),
                token: token
            }
        });

        console.log("Resposta Create:", createRes.status, createRes.data.nome);
        const imageUrl = createRes.data.imagem;
        console.log("URL da Imagem:", imageUrl);

        console.log("3. Verificar persistência...");
        if (!imageUrl) throw new Error("URL de imagem vazio!");

        // Tentar buscar a imagem
        try {
            const checkRes = await axios.get(imageUrl);
            console.log("GET Imagem: SUCESSO. Status:", checkRes.status);
            console.log("Content-Type:", checkRes.headers['content-type']);
            console.log("Content-Length:", checkRes.headers['content-length']);

            if (checkRes.headers['content-type'] && checkRes.headers['content-type'].includes('text/html')) {
                console.error("ALERTA: O servidor devolveu HTML em vez de imagem! (SPA fallback?)");
            }
        } catch (err) {
            console.error("GET Imagem: FALHA.", err.message);
        }

        // Verificar ficheiro no disco
        // Extrair nome do ficheiro do URL
        const filename = imageUrl.split('/').pop();
        const localPath = path.join(__dirname, 'uploads', filename);
        console.log("Verificando caminho local:", localPath);
        if (fs.existsSync(localPath)) {
            console.log("Ficheiro EXISTE no disco.");
        } else {
            console.log("Ficheiro NÃO EXISTE no disco.");
            // Listar diretoria uploads para debug
            console.log("Conteúdo de uploads:", fs.readdirSync(path.join(__dirname, 'uploads')));
        }

    } catch (err) {
        console.error("ERRO:", err.message);
        if (err.response) console.error("Detalhes:", err.response.data);
    } finally {
        if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
        pool.end();
    }
}

testCourseUpload();
