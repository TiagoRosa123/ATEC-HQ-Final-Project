-- Seed Data for Schedule Verification

-- 1. Create Areas
INSERT INTO areas (nome, descricao) VALUES 
('Informatica', 'Cibersegurança'),
('Soldadura', 'Robótica e Automação')
ON CONFLICT (nome) DO NOTHING;

-- 2. Create Rooms
INSERT INTO salas (area_id, nome, capacidade, recursos, estado) VALUES 
((SELECT id FROM areas WHERE nome = 'Informatica'), 'Sala 1', 20, 'Computadores, Projetor', 'disponivel'),
((SELECT id FROM areas WHERE nome = 'Informatica'), 'Sala 2', 20, 'Computadores, Projetor', 'disponivel'),
((SELECT id FROM areas WHERE nome = 'Soldadura'), 'Sala 3', 15, 'Oficina de Soldadura', 'disponivel')
ON CONFLICT DO NOTHING;

-- 3. Create Users (Trainers)
-- Password hash for '123456' (bcrypt) - adjust if your hash function differs or use existing users
INSERT INTO utilizadores (nome, email, password_hash, role, ativado) VALUES 
('Tiago', 'tiago.formador@atec.pt', '$2a$10$X7.12345678901234567890123456789012345678901234567890', 'formador', TRUE),
('Ana', 'ana.formadora@atec.pt', '$2a$10$X7.12345678901234567890123456789012345678901234567890', 'formador', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 4. Create Trainers (Link to Users)
INSERT INTO formadores (utilizador_id, nome, cor_calendario) VALUES 
((SELECT id FROM utilizadores WHERE email = 'tiago.formador@atec.pt'), 'Tiago', '#3174ad'),
((SELECT id FROM utilizadores WHERE email = 'ana.formadora@atec.pt'), 'Ana', '#e67300')
ON CONFLICT DO NOTHING;

-- 5. Create Courses
INSERT INTO cursos (area_id, nome, sigla, descricao, duracao_horas) VALUES 
((SELECT id FROM areas WHERE nome = 'Informatica'), 'Tecnico de Gestao e Programacao', 'TGPSI', 'Curso de Programacao', 1200)
ON CONFLICT DO NOTHING;

-- 6. Create Classes (Turmas)
INSERT INTO turmas (codigo, curso_id, data_inicio, data_fim, coordenador_id, estado) VALUES 
('TGPSI-1024', (SELECT id FROM cursos WHERE sigla = 'TGPSI'), CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 year', (SELECT id FROM formadores LIMIT 1), 'ativa')
ON CONFLICT (codigo) DO NOTHING;

-- 7. Create Modules
INSERT INTO modulos (nome, horas_totais, codigo) VALUES 
('Algoritmos', 50, 'M01'),
('Bases de Dados', 50, 'M02')
ON CONFLICT DO NOTHING;

-- 8. Create Schedules (Horarios)
-- Schedule for tomorrow
INSERT INTO horarios (turma_id, modulo_id, formador_id, sala_id, data_aula, hora_inicio, hora_fim) VALUES 
(
    (SELECT id FROM turmas WHERE codigo = 'TGPSI-1024'),
    (SELECT id FROM modulos WHERE nome = 'Algoritmos'),
    (SELECT id FROM formadores WHERE nome = 'Tiago'),
    (SELECT id FROM salas WHERE nome = 'Sala 1'),
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '13:00:00'
),
(
    (SELECT id FROM turmas WHERE codigo = 'TGPSI-1024'),
    (SELECT id FROM modulos WHERE nome = 'Bases de Dados'),
    (SELECT id FROM formadores WHERE nome = 'Ana'),
    (SELECT id FROM salas WHERE nome = 'Sala 2'),
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    '18:00:00'
);
