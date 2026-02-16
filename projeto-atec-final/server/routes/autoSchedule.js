const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

// Definição dos slots por regime
const SLOTS = {
  diurno: [
    { inicio: "08:00", fim: "11:00" },
    { inicio: "12:00", fim: "15:00" },
  ],
  noturno: [
    { inicio: "16:00", fim: "19:00" },
    { inicio: "20:00", fim: "23:00" },
  ],
};

// Calcular duração em horas de um slot
function slotDuration(inicio, fim) {
  const [hI, mI] = inicio.split(":").map(Number);
  const [hF, mF] = fim.split(":").map(Number);
  return hF + mF / 60 - (hI + mI / 60);
}

// Verificar se uma data é dia útil (seg-sex)
function isWeekday(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

// Gerar lista de datas entre início e fim
function getDateRange(start, end) {
  const dates = [];
  const current = new Date(start + "T12:00:00");
  const endDate = new Date(end + "T12:00:00");

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    if (isWeekday(dateStr)) {
      dates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// POST /api/schedules/generate
router.post("/generate", authorization, async (req, res) => {
  const client = await pool.connect();

  try {
    const { turma_id, data_inicio, data_fim, regime } = req.body;

    // Validações
    if (!turma_id || !data_inicio || !data_fim || !regime) {
      return res.status(400).json("Todos os campos são obrigatórios.");
    }

    if (!SLOTS[regime]) {
      return res
        .status(400)
        .json("Regime inválido. Use 'diurno' ou 'noturno'.");
    }

    // 1. Buscar turma e o seu curso
    const turmaRes = await client.query(
      "SELECT t.id, t.curso_id FROM turmas t WHERE t.id = $1",
      [turma_id]
    );
    if (turmaRes.rows.length === 0) {
      return res.status(404).json("Turma não encontrada.");
    }
    const cursoId = turmaRes.rows[0].curso_id;

    // 2. Buscar módulos do curso com horas
    const modulosRes = await client.query(
      `SELECT m.id, m.nome, m.horas_totais, cm.ordem_sequencia
       FROM curso_modulos cm
       JOIN modulos m ON cm.modulo_id = m.id
       WHERE cm.curso_id = $1
       ORDER BY cm.ordem_sequencia`,
      [cursoId]
    );

    if (modulosRes.rows.length === 0) {
      return res
        .status(400)
        .json(
          "Este curso não tem módulos associados. Adicione módulos em curso_modulos."
        );
    }

    // 3. Para cada módulo, calcular horas restantes
    const modulos = [];
    for (const mod of modulosRes.rows) {
      const usoRes = await client.query(
        `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (hora_fim - hora_inicio))/3600), 0) as total_horas
         FROM horarios 
         WHERE turma_id = $1 AND modulo_id = $2`,
        [turma_id, mod.id]
      );
      const horasUsadas = parseFloat(usoRes.rows[0].total_horas);
      const horasRestantes = mod.horas_totais - horasUsadas;

      if (horasRestantes > 0) {
        modulos.push({
          id: mod.id,
          nome: mod.nome,
          horasRestantes: horasRestantes,
          horasTotais: mod.horas_totais,
        });
      }
    }

    if (modulos.length === 0) {
      return res
        .status(400)
        .json(
          "Todos os módulos já atingiram o limite de horas para esta turma."
        );
    }

    // 4. Buscar formadores com competências
    const formadoresRes = await client.query(
      `SELECT DISTINCT cf.formador_id, cf.modulo_id
       FROM competencias_formador cf`
    );

    // Mapear módulo -> formadores disponíveis
    const formadoresPorModulo = {};
    for (const row of formadoresRes.rows) {
      if (!formadoresPorModulo[row.modulo_id]) {
        formadoresPorModulo[row.modulo_id] = [];
      }
      formadoresPorModulo[row.modulo_id].push(row.formador_id);
    }

    // 5. Buscar salas disponíveis
    const salasRes = await client.query("SELECT id, nome FROM salas");
    const salas = salasRes.rows;

    if (salas.length === 0) {
      return res
        .status(400)
        .json("Não existem salas registadas no sistema.");
    }

    // 6. Gerar horários 
    const slots = SLOTS[regime];
    const dates = getDateRange(data_inicio, data_fim);

    let criadas = 0;
    const avisos = [];
    let moduloIdx = 0;

    await client.query("BEGIN");

    for (const date of dates) {
      if (moduloIdx >= modulos.length) break; // Todos os módulos agendados

      for (const slot of slots) {
        if (moduloIdx >= modulos.length) break;

        const modAtual = modulos[moduloIdx];
        const duracao = slotDuration(slot.inicio, slot.fim);

        // Verificar se o módulo ainda precisa de horas
        if (modAtual.horasRestantes <= 0) {
          moduloIdx++;
          if (moduloIdx >= modulos.length) break;
          continue;
        }

        // Ajustar fim do slot se o módulo não precisa de tantas horas
        let horaFim = slot.fim;
        if (modAtual.horasRestantes < duracao) {
          const [hI] = slot.inicio.split(":").map(Number);
          const fimH = hI + Math.ceil(modAtual.horasRestantes);
          horaFim = `${String(fimH).padStart(2, "0")}:00`;
        }

        const duracaoReal = slotDuration(slot.inicio, horaFim);

        // Encontrar formador disponível
        const formadoresModulo = formadoresPorModulo[modAtual.id] || [];

        if (formadoresModulo.length === 0) {
          // Fallback: usar qualquer formador
          const allFormadores = await client.query(
            "SELECT id FROM formadores"
          );
          for (const f of allFormadores.rows) {
            if (!formadoresModulo.includes(f.id)) {
              formadoresModulo.push(f.id);
            }
          }
        }

        let formadorId = null;
        for (const fid of formadoresModulo) {
          // Verificar conflitos de horário para o formador
          const conflicto = await client.query(
            `SELECT id FROM horarios 
             WHERE formador_id = $1 AND data_aula = $2
             AND tsrange(data_aula + hora_inicio, data_aula + hora_fim) && 
                 tsrange($2::date + $3::time, $2::date + $4::time)`,
            [fid, date, slot.inicio, horaFim]
          );
          if (conflicto.rows.length === 0) {
            formadorId = fid;
            break; // Encontrou um livre
          }
        }

        if (!formadorId) {
          avisos.push(
            `${date} ${slot.inicio}: Sem formador disponível para ${modAtual.nome}`
          );
          continue; // Tenta próximo slot
        }

        // Encontrar sala disponível
        let salaId = null;
        for (const sala of salas) {
          const conflicto = await client.query(
            `SELECT id FROM horarios 
             WHERE sala_id = $1 AND data_aula = $2
             AND tsrange(data_aula + hora_inicio, data_aula + hora_fim) && 
                 tsrange($2::date + $3::time, $2::date + $4::time)`,
            [sala.id, date, slot.inicio, horaFim]
          );
          if (conflicto.rows.length === 0) {
            salaId = sala.id;
            break; // Encontrou uma livre
          }
        }

        if (!salaId) {
          avisos.push(
            `${date} ${slot.inicio}: Sem sala disponível para ${modAtual.nome}`
          );
          continue;
        }

        // Inserir aula
        try {
          await client.query(
            `INSERT INTO horarios (turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [turma_id, modAtual.id, formadorId, salaId, date, slot.inicio, horaFim]
          );
          criadas++;
          modAtual.horasRestantes -= duracaoReal;

          // Se modulo terminou as horas, avança para o próximo
          if (modAtual.horasRestantes <= 0) {
            moduloIdx++;
          }
        } catch (insertErr) {
          // Tratar conflito de constraint caso algo tenha falhado na verificação manual
          if (insertErr.code === "23P01") {
            avisos.push(
              `${date} ${slot.inicio}: Conflito de horário para ${modAtual.nome}`
            );
          } else {
            throw insertErr;
          }
        }
      }
    }

    await client.query("COMMIT"); // Confirma todas as alterações

    // Resumo dos módulos não totalmente agendados
    const naoAgendados = modulos
      .filter((m) => m.horasRestantes > 0)
      .map((m) => `${m.nome}: ${m.horasRestantes.toFixed(1)}h restantes`);

    res.json({
      sucesso: true,
      criadas,
      naoAgendados,
      avisos: avisos.slice(0, 20), // Limitar avisos
      mensagem: `${criadas} aulas criadas com sucesso!`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro na geração automática:", err.message);
    res.status(500).json("Erro ao gerar horários: " + err.message);
  } finally {
    client.release();
  }
});

module.exports = router;
