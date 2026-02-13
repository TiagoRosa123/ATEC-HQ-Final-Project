const pool = require("./db");

async function migrate() {
  try {
    console.log("Creating table 'reservas_salas'...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservas_salas (
        id SERIAL PRIMARY KEY,
        sala_id INT REFERENCES salas(id) ON DELETE CASCADE,
        formador_id INT REFERENCES formadores(id) ON DELETE CASCADE,
        data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
        data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
        motivo TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT no_overlap EXCLUDE USING gist (
          sala_id WITH =,
          tsrange(data_inicio, data_fim) WITH &&
        )
      );
    `);

    console.log("Table 'reservas_salas' created successfully!");
    process.exit();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

migrate();
