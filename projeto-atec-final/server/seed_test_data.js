const pool = require("./db");
const bcrypt = require("bcryptjs");

async function seed() {
    try {
        console.log("Seeding test data...");

        // 1. Ensure an Area exists
        let areaId;
        const areaRes = await pool.query("INSERT INTO areas (nome, descricao) VALUES ('Programação', 'Área de TI') ON CONFLICT DO NOTHING RETURNING id");
        if (areaRes.rows.length > 0) {
            areaId = areaRes.rows[0].id;
        } else {
            const areaCheck = await pool.query("SELECT id FROM areas LIMIT 1");
            areaId = areaCheck.rows[0].id;
        }

        // 2. Create Rooms (Salas)
        console.log("Creating/Ensuring Rooms...");
        await pool.query(`
      INSERT INTO salas (area_id, nome, capacidade, recursos, estado)
      VALUES 
      ($1, 'Sala 1.01', 20, 'Projetor, PC', 'disponivel'),
      ($1, 'Sala 1.02', 15, 'Quadro Branco', 'disponivel')
    `, [areaId]);

        // 3. Create active Course
        console.log("Creating Active Course...");
        const courseRes = await pool.query(`
      INSERT INTO cursos (area_id, nome, descricao, duracao_horas)
      VALUES ($1, 'Curso Mobile Dev', 'Desenvolvimento Android', 100)
      RETURNING id
    `, [areaId]);
        const courseId = courseRes.rows[0].id;

        // 4. Create Active Class (Turma)
        console.log("Creating Active Class (Turma)...");
        const turmaRes = await pool.query(`
      INSERT INTO turmas (curso_id, codigo, data_inicio, data_fim, estado)
      VALUES ($1, 'MOB-2024', NOW() - INTERVAL '1 month', NOW() + INTERVAL '2 months', 'ativa')
      RETURNING id
    `, [courseId]);
        const turmaId = turmaRes.rows[0].id;

        // 5. Create Students (Formandos) & Enroll
        console.log("Creating Students and Enrolling...");
        const salt = await bcrypt.genSalt(10);
        const pwd = await bcrypt.hash("123456", salt);

        // Student 1
        const user1 = await pool.query(`
      INSERT INTO utilizadores (nome, email, password_hash, role)
      VALUES ('Aluno Teste 1', 'aluno1@atec.test', $1, 'formando')
      ON CONFLICT (email) DO UPDATE SET role = 'formando'
      RETURNING id
    `, [pwd]);

        // Check if formando exists
        let formando1Id;
        const f1Check = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [user1.rows[0].id]);
        if (f1Check.rows.length === 0) {
            const f1 = await pool.query("INSERT INTO formandos (utilizador_id, nome) VALUES ($1, 'Aluno Teste 1') RETURNING id", [user1.rows[0].id]);
            formando1Id = f1.rows[0].id;
        } else {
            formando1Id = f1Check.rows[0].id;
        }

        // Student 2
        const user2 = await pool.query(`
      INSERT INTO utilizadores (nome, email, password_hash, role)
      VALUES ('Aluno Teste 2', 'aluno2@atec.test', $1, 'formando')
      ON CONFLICT (email) DO UPDATE SET role = 'formando'
      RETURNING id
    `, [pwd]);

        let formando2Id;
        const f2Check = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [user2.rows[0].id]);
        if (f2Check.rows.length === 0) {
            const f2 = await pool.query("INSERT INTO formandos (utilizador_id, nome) VALUES ($1, 'Aluno Teste 2') RETURNING id", [user2.rows[0].id]);
            formando2Id = f2.rows[0].id;
        } else {
            formando2Id = f2Check.rows[0].id;
        }

        // Enrollments
        await pool.query(`
      INSERT INTO inscricoes (turma_id, formando_id, estado)
      VALUES 
      ($1, $2, 'ativa'),
      ($1, $3, 'ativa')
      ON CONFLICT DO NOTHING
    `, [turmaId, formando1Id, formando2Id]);

        console.log("Seeding complete!");
        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

seed();
