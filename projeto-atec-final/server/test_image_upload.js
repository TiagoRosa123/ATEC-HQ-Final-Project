const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// 1. Criar imagem dummy
const dummyImagePath = path.join(__dirname, 'test_image.png');
// Create a simple 1x1 pixel PNG
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
fs.writeFileSync(dummyImagePath, Buffer.from(base64Image, 'base64'));

// Função auxiliar para DB
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function testUpload() {
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
        const userId = loginRes.data.user.id;
        console.log("Login OK. Token obtido.");

        console.log("2. Upload de Imagem de Perfil...");
        const form = new FormData();
        form.append('file', fs.createReadStream(dummyImagePath));

        const uploadRes = await axios.post(`http://localhost:5000/files/avatar/${userId}`, form, {
            headers: {
                ...form.getHeaders(),
                token: token
            }
        });

        console.log("Upload Resposta:", uploadRes.data);
        const fileUrl = uploadRes.data.url;
        console.log("URL da Imagem:", fileUrl);

        console.log("3. Verificar se a imagem é acessível...");
        try {
            const checkRes = await axios.get(fileUrl);
            console.log("Acesso à imagem: SUCESSO. Status:", checkRes.status);
        } catch (err) {
            console.error("Acesso à imagem: FALHA.", err.message);
        }

    } catch (err) {
        console.error("ERRO TESTE:", err.message);
        if (err.response) console.error("Detalhes:", err.response.data);
    } finally {
        // Limpar
        if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
    }
}

testUpload();
