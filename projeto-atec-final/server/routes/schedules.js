const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const verifyScheduleManager = require("../middleware/verifyScheduleManager");
const autoScheduleRouter = require("./autoSchedule");

// Montar sub-rota de geração automática
router.use("/", autoScheduleRouter);

// GET /api/schedules
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

    // Filtro por Intervalo de Datas (performance)
    if (start && end) {
      query += ` AND h.data_aula BETWEEN $${paramCounter} AND $${paramCounter + 1}`;
      values.push(start, end);
      paramCounter += 2;
    }

    // ---------------------------------------------------------
    // FILTRAGEM AUTOMÁTICA POR ROLE (Formador vê apenas o seu)
    // ---------------------------------------------------------
    const userRoleQuery = await pool.query("SELECT role FROM utilizadores WHERE id = $1", [req.user.id]);
    const userRole = userRoleQuery.rows[0]?.role;

    if (userRole === 'formador') {
      const formador = await pool.query("SELECT id FROM formadores WHERE utilizador_id = $1", [req.user.id]);
      if (formador.rows.length > 0) {
        const formadorId = formador.rows[0].id;
        // Força o filtro pelo ID do formador logado
        query += ` AND h.formador_id = $${paramCounter}`;
        values.push(formadorId);
        paramCounter++;
      }
    } else if (userRole === 'formando') {
      // Lógica para Formando: busca a turma em que está inscrito
      const formando = await pool.query("SELECT id FROM formandos WHERE utilizador_id = $1", [req.user.id]);
      if (formando.rows.length > 0) {
        const formandoId = formando.rows[0].id;
        // Busca a inscrição mais recente (ou ativa)
        const inscricao = await pool.query("SELECT turma_id FROM inscricoes WHERE formando_id = $1 ORDER BY data_inscricao DESC LIMIT 1", [formandoId]);

        if (inscricao.rows.length > 0) {
          const turmaId = inscricao.rows[0].turma_id;
          query += ` AND h.turma_id = $${paramCounter}`;
          values.push(turmaId);
          paramCounter++;
        } else {
          // Se não tem turma, não vê nada (hack: filtro impossível)
          query += ` AND 1=0`;
        }
      }
    } else {
      // Se NÃO for formador (ex: Admin, Secretária), permite filtros manuais da query string
      if (type && id) {
        if (type === "curso") {
          query += ` AND t.curso_id = $${paramCounter}`;
          values.push(id);
          paramCounter++;
        } else if (type === "formador") {
          query += ` AND f.utilizador_id = $${paramCounter}`;
          values.push(id);
          paramCounter++;
        } else if (type === "sala") {
          query += ` AND h.sala_id = $${paramCounter}`;
          values.push(id);
          paramCounter++;
        } else if (type === "turma") {
          query += ` AND h.turma_id = $${paramCounter}`;
          values.push(id);
          paramCounter++;
        }
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
        // Campos extra para Drag & Drop e Updates
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
router.post("/", authorization, verifyScheduleManager, async (req, res) => {
  try {
    const { turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim } = req.body;

    // Validar campos obrigatórios
    if (!turma_id || !modulo_id || !formador_id || !sala_id || !data_aula || !hora_inicio || !hora_fim) {
      return res.status(400).json("Todos os campos são obrigatórios.");
    }

    // Validação de Fim de Semana (Backend)
    const dateObj = new Date(data_aula);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json("Não é permitido agendar aulas ao fim de semana.");
    }

    //Não excede horas do modulo
    //busca limite do módulo
    const modInfo = await pool.query("SELECT horas_totais FROM modulos WHERE id = $1", [modulo_id]);
    if (modInfo.rows.length === 0) return res.status(400).json("Módulo não encontrado.");

    const horasLimite = modInfo.rows[0].horas_totais;

    // Calcular horas já agendadas
    const usoAtual = await pool.query(`
            SELECT SUM(EXTRACT(EPOCH FROM (hora_fim - hora_inicio))/3600) as total_horas
            FROM horarios 
            WHERE turma_id = $1 AND modulo_id = $2
        `, [turma_id, modulo_id]);

    const horasAgendadas = parseFloat(usoAtual.rows[0].total_horas) || 0;

    // Calcular duração da nova aula
    const [hI, mI] = hora_inicio.split(':').map(Number);
    const [hF, mF] = hora_fim.split(':').map(Number);
    const duracaoNova = (hF + mF / 60) - (hI + mI / 60);

    if (duracaoNova <= 0) return res.status(400).json("Hora de fim deve ser superior à de início.");

    // 4. Verificar excesso
    if (horasAgendadas + duracaoNova > horasLimite) {
      return res.status(400).json(`Limite de horas ultrapassado! (Máx: ${horasLimite}h, Agendado: ${horasAgendadas.toFixed(1)}h, Tentativa: +${duracaoNova.toFixed(1)}h)`);
    }

    const query = `
            INSERT INTO horarios (turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

    const newSchedule = await pool.query(query, [turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim]);

    // Quando sala é ocupada, estado passa a 'indisponivel'
    await pool.query("UPDATE salas SET estado = 'indisponivel' WHERE id = $1", [sala_id]);

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
router.put("/:id", authorization, verifyScheduleManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim } = req.body;

    // Validar campos obrigatórios (EVITAR QUE VIREM NULL)
    if (!turma_id || !modulo_id || !formador_id || !sala_id || !data_aula || !hora_inicio || !hora_fim) {
      return res.status(400).json("Dados incompletos. Todos os campos são obrigatórios.");
    }

    // Validação de Fim de Semana (Backend)
    const dateObjPut = new Date(data_aula);
    const dayOfWeekPut = dateObjPut.getDay();
    if (dayOfWeekPut === 0 || dayOfWeekPut === 6) {
      return res.status(400).json("Não é permitido agendar aulas ao fim de semana.");
    }

    // VALIDAÇÃO DE HORAS (Igual ao POST, mas excluindo o próprio ID da soma)
    const modInfo = await pool.query("SELECT horas_totais FROM modulos WHERE id = $1", [modulo_id]);
    if (modInfo.rows.length === 0) return res.status(400).json("Módulo não encontrado.");

    const horasLimite = modInfo.rows[0].horas_totais;

    // Soma TUDO MENOS a aula atual
    const usoAtual = await pool.query(`
        SELECT SUM(EXTRACT(EPOCH FROM (hora_fim - hora_inicio))/3600) as total_horas
        FROM horarios 
        WHERE turma_id = $1 AND modulo_id = $2 AND id != $3
    `, [turma_id, modulo_id, id]);

    const horasAgendadas = parseFloat(usoAtual.rows[0].total_horas) || 0;

    const [hI, mI] = hora_inicio.split(':').map(Number);
    const [hF, mF] = hora_fim.split(':').map(Number);
    const duracaoNova = (hF + mF / 60) - (hI + mI / 60);

    if (duracaoNova <= 0) return res.status(400).json("Hora de fim deve ser superior à de início.");

    if (horasAgendadas + duracaoNova > horasLimite) {
      return res.status(400).json(`Limite de horas ultrapassado! (Máx: ${horasLimite}h, Uso Outras Aulas: ${horasAgendadas.toFixed(1)}h, Nova Duração: ${duracaoNova.toFixed(1)}h)`);
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
router.delete("/:id", authorization, verifyScheduleManager, async (req, res) => {
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
