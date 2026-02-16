const router = require('express').Router();
const sendEmail = require('../utils/sendEmail');

// POST /application - Envia email de candidatura
router.post('/application', async (req, res) => {
    try {
        const { nome, email, telefone, curso, mensagem } = req.body;

        // Validação básica
        if (!nome || !email || !curso) {
            return res.status(400).json({ message: "Nome, Email e Curso são obrigatórios." });
        }

        const emailDestino = "ateqhq@gmail.com";
        const assunto = `Nova Candidatura: ${nome} - ${curso}`;

        const mensagemTexto = `
            Nova Candidatura Recebida:
            
            Nome: ${nome}
            Email: ${email}
            Telefone: ${telefone || "N/A"}
            Curso de Interesse: ${curso}
            
            Mensagem do Candidato:
            ${mensagem || "Sem mensagem adicional."}
        `;

        const mensagemHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #007bff;">Nova Candidatura Recebida</h2>
                <p><strong>Curso de Interesse:</strong> ${curso}</p>
                <hr>
                <h3>Dados do Candidato:</h3>
                <ul>
                    <li><strong>Nome:</strong> ${nome}</li>
                    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
                    <li><strong>Telefone:</strong> ${telefone || "N/A"}</li>
                </ul>
                <hr>
                <h3>Mensagem:</h3>
                <p style="white-space: pre-wrap;">${mensagem || "Sem mensagem adicional."}</p>
            </div>
        `;

        await sendEmail({
            email: emailDestino,
            subject: assunto,
            message: mensagemTexto,
            html: mensagemHtml
        });

        res.json({ message: "Candidatura enviada com sucesso! Entraremos em contacto brevemente." });

    } catch (err) {
        console.error("Erro ao enviar candidatura:", err);
        res.status(500).json({ message: "Erro ao enviar candidatura. Por favor tente mais tarde." });
    }
});

module.exports = router;
