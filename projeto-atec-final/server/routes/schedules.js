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
                h.modulo_id, -- Necessário para D&D manter o módulo original
                f.cor_calendario as color -- Cor do formador
            FROM horarios h
            LEFT JOIN modulos m ON h.modulo_id = m.id -- Alterado para LEFT JOIN para não "sumir" se modulo for null
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
      const dateStr = new Date(row.data_aula).toISOString().split("T")[0]; // YYYY-MM-DD

      return {
        id: row.id,
        title: `${row.title || 'Sem Módulo'} (${row.turma_codigo || 'N/A'})`, // Fallback title
        start: `${dateStr}T${row.hora_inicio}`,
        end: `${dateStr}T${row.hora_fim}`,
        resource: {
          sala: row.sala_nome,
          formador: row.formador_nome,
          turma: row.turma_codigo,
        },
        color: row.color || "#3174ad",
        // Campos extra para D&D e Updates
        turma_id: row.turma_id,
        formador_id: row.formador_id,
        sala_id: row.sala_id,
        modulo_id: row.modulo_id, 
      };
    });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor ao buscar horários");
  }
});

// POST /api/schedules
router.post("/", authorization, async (req, res) => {
    try {
        const { turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim } = req.body;

        // Validar campos obrigatórios
        if (!turma_id || !modulo_id || !formador_id || !sala_id || !data_aula || !hora_inicio || !hora_fim) {
            return res.status(400).json("Todos os campos são obrigatórios.");
        }

        const query = `
            INSERT INTO horarios (turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const newSchedule = await pool.query(query, [turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim]);

        res.json(newSchedule.rows[0]);

    } catch (err) {
        console.error(err.message);
        if (err.code === '23P01') { // Exclusion violation (Overlap)
            return res.status(409).json("Conflito de horário! Sala, Formador ou Turma já ocupados neste período.");
        }
        res.status(500).send("Erro ao criar horário");
    }
});

// PUT /api/schedules/:id
router.put("/:id", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim } = req.body;

        // Validar campos obrigatórios (EVITAR QUE VIREM NULL)
        if (!turma_id || !modulo_id || !formador_id || !sala_id || !data_aula || !hora_inicio || !hora_fim) {
             return res.status(400).json("Dados incompletos. Todos os campos são obrigatórios.");
        }

        const query = `
            UPDATE horarios 
            SET turma_id = $1, modulo_id = $2, formador_id = $3, sala_id = $4, data_aula = $5, hora_inicio = $6, hora_fim = $7
            WHERE id = $8
            RETURNING *
        `;

        const updateSchedule = await pool.query(query, [turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim, id]);

        if (updateSchedule.rows.length === 0) {
            return res.status(404).json("Horário não encontrado.");
        }

        res.json(updateSchedule.rows[0]);

    } catch (err) {
        console.error(err.message);
        if (err.code === '23P01') {
             return res.status(409).json("Conflito de horário! Sobreposição detectada.");
        }
        res.status(500).send("Erro ao atualizar horário");
    }
});

// DELETE /api/schedules/:id
router.delete("/:id", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteSchedule = await pool.query("DELETE FROM horarios WHERE id = $1 RETURNING *", [id]);

        if (deleteSchedule.rows.length === 0) {
            return res.status(404).json("Horário não encontrado.");
        }

        res.json("Horário removido com sucesso.");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro ao remover horário");
    }
});

// GET /api/schedules/trainers (Helper para dropdown)
router.get("/trainers-list", authorization, async (req, res) => {
    try {
        // Obter formadores com ID da tabela 'formadores' e Nome
        const query = `
            SELECT f.id, u.nome
            FROM formadores f
            JOIN utilizadores u ON f.utilizador_id = u.id
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro ao buscar formadores");
    }
});

module.exports = router;
