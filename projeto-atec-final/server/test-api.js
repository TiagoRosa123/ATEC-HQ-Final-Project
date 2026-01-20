const pool = require('./db');
// const fetch = require('node-fetch'); // REMOVED: Node v18+ has native fetch

/**
 * Script de Teste Avançado da API (E2E)
 * Executar com: node test-api.js
 * 
 * FLUXO DE TESTE:
 * 1. Limpeza (Apagar user de teste se existir)
 * 2. Registo (Cria user)
 * 3. Validação de Erro (Registo duplicado)
 * 4. Ativação Manual (Via SQL para permitir login)
 * 5. Login (Obter Token)
 * 6. Controlo de Acesso (Tentar Rota Admin como User - deve falhar)
 * 7. Promoção a Admin (Via SQL)
 * 8. Rota Admin (Como Admin - deve dar)
 * 9. Funcionalidade Admin (Criar outro user via API de Admin)
 * 10. Limpeza Final
 */

const BASE_URL = 'http://localhost:5000';

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m"
};

const TEST_USER = {
    nome: "Auto Test Bot",
    email: `auto.bot.${Date.now()}@teste.com`,
    password: "password123"
};

const ADMIN_USER_TO_CREATE = {
    nome: "User Created By Admin",
    email: `sub.user.${Date.now()}@teste.com`,
    password: "subpassword123",
    is_admin: false
};

async function runTests() {
    console.log(`${colors.cyan}=== INICIANDO SUITE DE TESTES AVANÇADA ===${colors.reset}\n`);

    try {
        // --- 1. LIMPEZA INICIAL ---
        process.stdout.write(`1. [SETUP] Limpando dados antigos... `);
        // Apaga users que tenham emails parecidos com os nossos de teste
        await pool.query("DELETE FROM utilizadores WHERE email LIKE 'auto.bot.%' OR email LIKE 'sub.user.%'");
        console.log(`${colors.green}OK${colors.reset}`);


        // --- 2. REGISTO ---
        const registerRes = await testEndpoint('Registo', '/auth/register', 'POST', TEST_USER);
        if (!registerRes) throw new Error("Falha no Registo");

        // --- 3. PROVAR DUPLICADO ---
        process.stdout.write(`3. [VALIDAÇÃO] Testando email duplicado... `);
        const dupRes = await fetch(BASE_URL + '/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });
        if (dupRes.status === 401) console.log(`${colors.green}SUCESSO (Bloqueado 401)${colors.reset}`);
        else console.log(`${colors.red}FALHOU (Status ${dupRes.status})${colors.reset}`);


        // --- 4. ATIVAÇÃO MANUAL (SQL) ---
        process.stdout.write(`4. [DB] Ativando conta manualmente... `);
        await pool.query("UPDATE utilizadores SET ativado = true WHERE email = $1", [TEST_USER.email]);
        console.log(`${colors.green}OK (SQL Update)${colors.reset}`);


        // --- 5. LOGIN ---
        const loginData = await testEndpoint('Login', '/auth/login', 'POST', {
            email: TEST_USER.email,
            password: TEST_USER.password
        });

        if (!loginData || !loginData.token) throw new Error("Login não retornou token");
        const TOKEN = loginData.token;
        const ID = loginData.user.id;
        console.log(`   🔑 Token obtido: ${TOKEN.substring(0, 15)}...`);


        // --- 6. ACESSO NEGADO (User -> Admin) ---
        process.stdout.write(`6. [SEGURANÇA] Tentando aceder a Admin como User normal... `);
        const forbiddenRes = await fetch(BASE_URL + '/admin/todos', {
            headers: { 'token': TOKEN } // O middleware espera 'token' no header
        });
        if (forbiddenRes.status === 403) console.log(`${colors.green}SUCESSO (Bloqueado 403)${colors.reset}`);
        else console.log(`${colors.red}FALHA DE SEGURANÇA! (Status ${forbiddenRes.status})${colors.reset}`);


        // --- 7. PROMOÇÃO A ADMIN (SQL) ---
        process.stdout.write(`7. [DB] Promovendo utilizador a ADMIN... `);
        await pool.query("UPDATE utilizadores SET is_admin = true, role = 'admin' WHERE id = $1", [ID]);
        console.log(`${colors.green}OK (SQL Update)${colors.reset}`);


        // --- 8. ACESSO ADMIN (Agora deve dar) ---
        const adminData = await testEndpoint('Admin Listagem', '/admin/todos', 'GET', null, 200, TOKEN);
        if (!Array.isArray(adminData)) console.log(`${colors.yellow}   Aviso: Resposta não é array${colors.reset}`);
        else console.log(`   👥 Utilizadores encontrados: ${adminData.length}`);


        // --- 9. CRIAR USER COMO ADMIN ---
        const newUserCreatedByAdmin = await testEndpoint('Admin: Criar User', '/admin/criar', 'POST', ADMIN_USER_TO_CREATE, 200, TOKEN);


        // --- 10. LIMPEZA FINAL ---
        process.stdout.write(`10. [CLEANUP] Apagando dados de teste... `);
        await pool.query("DELETE FROM utilizadores WHERE id = $1", [ID]);
        if (newUserCreatedByAdmin && newUserCreatedByAdmin.id) {
            await pool.query("DELETE FROM utilizadores WHERE id = $1", [newUserCreatedByAdmin.id]);
        }
        console.log(`${colors.green}OK${colors.reset}`);

        console.log(`\n${colors.cyan}=== TODOS OS TESTES PASSARAM ===${colors.reset}`);

    } catch (error) {
        console.log(`\n${colors.red}❌ ERRO CRÍTICO NOS TESTES:${colors.reset} ${error.message}`);
    } finally {
        pool.end(); // Fecha conexão SQL
    }
}

async function testEndpoint(testName, endpoint, method, body = null, expectedStatus = 200, token = null) {
    process.stdout.write(`Testando ${colors.blue}${testName}${colors.reset}... `);

    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) options.headers['token'] = token;
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(BASE_URL + endpoint, options);

        let data = {};
        try { data = await response.json(); } catch (e) { }

        if (response.status === expectedStatus) {
            console.log(`${colors.green}SUCESSO${colors.reset}`);
            return data;
        } else {
            console.log(`${colors.red}FALHOU (${response.status} vs ${expectedStatus})${colors.reset}`);
            console.log(`   Resposta: ${JSON.stringify(data)}`);
            return null;
        }

    } catch (error) {
        console.log(`${colors.red}ERRO DE FETCH${colors.reset}`);
        throw error;
    }
}

// Verifica e corre
if (typeof fetch === 'undefined') {
    console.log(`${colors.red}Node >= 18 necessário.${colors.reset}`);
} else {
    runTests();
}
