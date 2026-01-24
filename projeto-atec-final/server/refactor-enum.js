const pool = require('./db');

async function migrateEnum() {
    try {
        console.log("⏳ A iniciar migração para ENUM...");

        // 1. Criar o TYPE
        await pool.query("DO $$ BEGIN CREATE TYPE user_role_enum AS ENUM ('admin', 'formador', 'formando', 'user', 'funcionario'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
        console.log("✅ Type 'user_role_enum' verificado/criado.");

        // 2. Converter a coluna (com cast explícito)
        // Nota: Se tiveres valores na BD que não estejam na lista acima, isto vai falhar!
        await pool.query(`
            ALTER TABLE utilizadores 
            ALTER COLUMN role DROP DEFAULT,
            ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum,
            ALTER COLUMN role SET DEFAULT 'user'::user_role_enum;
        `);
        console.log("✅ Coluna 'role' convertida com sucesso!");

        process.exit(0);
    } catch (err) {
        console.error("❌ Erro na migração:", err.message);
        process.exit(1);
    }
}

migrateEnum();
