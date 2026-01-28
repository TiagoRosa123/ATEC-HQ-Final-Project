const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

// GET /api/schedules
// Query Params: start (date), end (date), type (turma/formador/sala), id (optional entity id)
router.get("/", authorization, async (req, res) => {
  try {
    const { start, end, type, id } = req.query;

    let query = `
            SELECT 
                h.id, 
                h.data_aula, 
                h.hora_inicio, 
                h.hora_fim, 
                m.nome as title, -- Usar nome do módulo como título principal
                s.nome as sala_nome, 
                t.codigo as turma_codigo, 
                u.nome as formador_nome,
                h.turma_id,
                h.formador_id,
                h.sala_id,
                f.cor_calendario as color -- Cor do formador
            FROM horarios h
            JOIN modulos m ON h.modulo_id = m.id
            LEFT JOIN turmas t ON h.turma_id = t.id
            LEFT JOIN salas s ON h.sala_id = s.id
            LEFT JOIN formadores f ON h.formador_id = f.id
            LEFT JOIN utilizadores u ON f.utilizador_id = u.id
            WHERE 1=1
        `;

    const values = [];
    let paramCounter = 1;

    // Filtro por Data (Obrigatório para performance, mas opcional na lógica)
    if (start && end) {
      query += ` AND h.data_aula BETWEEN $${paramCounter} AND $${paramCounter + 1}`;
      values.push(start, end);
      paramCounter += 2;
    }

    // Filtro Específico
    if (type && id) {
      if (type === "turma") {
        query += ` AND h.turma_id = $${paramCounter}`;
        values.push(id);
        paramCounter++;
      } else if (type === "formador") {
        // Recebemos o ID de utilizador do frontend (pois a lista vem de /admin/users)
        // Então filtramos pela relação formadores -> utilizadores
        query += ` AND f.utilizador_id = $${paramCounter}`;
        values.push(id);
        paramCounter++;
      } else if (type === "sala") {
        query += ` AND h.sala_id = $${paramCounter}`;
        values.push(id);
        paramCounter++;
      }
    }

    const result = await pool.query(query, values);

    // Formatar para o frontend (react-big-calendar espera start/end como objetos Date, mas API manda string)
    const events = result.rows.map((row) => {
      // Combinar data + hora
      // data_aula é 2025-11-20, hora_inicio é 09:00:00
      // Nota: O node-postgres pode retornar data_aula como objeto Date.

      const dateStr = new Date(row.data_aula).toISOString().split("T")[0]; // YYYY-MM-DD

      return {
        id: row.id,
        title: `${row.title} (${row.turma_codigo})`, // Ex: "Matemática (TPSI.0525)"
        start: `${dateStr}T${row.hora_inicio}`,
        end: `${dateStr}T${row.hora_fim}`,
        resource: {
          sala: row.sala_nome,
          formador: row.formador_nome,
          turma: row.turma_codigo,
        },
        color: row.color || "#3174ad", // Fallback color
      };
    });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor ao buscar horários");
  }
});

module.exports = router;
