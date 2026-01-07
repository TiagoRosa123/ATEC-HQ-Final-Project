-- 1. LIMPEZA TOTAL (Apaga as tabelas antigas para evitar conflitos)
DROP TABLE IF EXISTS horarios CASCADE;
DROP TABLE IF EXISTS formandos CASCADE;
DROP TABLE IF EXISTS curso_modulos CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS formadores CASCADE;
DROP TABLE IF EXISTS modulos CASCADE;
DROP TABLE IF EXISTS salas CASCADE;
DROP TABLE IF EXISTS utilizadores CASCADE;

-- 2. ATIVAR EXTENSÃO (Necessária para a validação de horários)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 3. CRIAR TABELAS INDEPENDENTES (Estas têm de ser criadas PRIMEIRO)
-- Tabela de Salas
CREATE TABLE salas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    capacidade INT NOT NULL
);

-- Tabela de Módulos
CREATE TABLE modulos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    horas_totais INT NOT NULL
);

-- Tabela de Formadores
CREATE TABLE formadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    foto_url TEXT,
    ficheiro_anexo_url TEXT
);

-- Tabela de Cursos (Esta é a que estava a faltar no erro anterior)
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    area VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE
);

-- Tabela de Utilizadores (Login)
CREATE TABLE utilizadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT,
    google_id TEXT,
    facebook_id TEXT,
    ativado BOOLEAN DEFAULT FALSE,
    token_ativacao TEXT,
    role VARCHAR(20) DEFAULT 'user'
);

-- 4. CRIAR TABELAS DEPENDENTES (Estas só funcionam se as de cima existirem)

-- Tabela de Ligação (Curso <-> Módulos <-> Formadores <-> Salas)
CREATE TABLE curso_modulos (
    id SERIAL PRIMARY KEY,
    curso_id INT REFERENCES cursos(id), -- Precisa da tabela 'cursos'
    modulo_id INT REFERENCES modulos(id), -- Precisa da tabela 'modulos'
    formador_id INT REFERENCES formadores(id), -- Precisa da tabela 'formadores'
    sala_id INT REFERENCES salas(id), -- Precisa da tabela 'salas'
    sequencia INT
);

-- Tabela de Formandos
CREATE TABLE formandos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    foto_url TEXT,
    ficheiro_anexo_url TEXT,
    curso_id INT REFERENCES cursos(id) -- Precisa da tabela 'cursos'
);

-- Tabela de Horários (A mais complexa)
CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,
    curso_modulo_id INT REFERENCES curso_modulos(id), -- Precisa da tabela 'curso_modulos'
    sala_id INT REFERENCES salas(id),
    formador_id INT REFERENCES formadores(id),
    data_aula DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    
    -- Validação: Sala não pode ter duas aulas ao mesmo tempo
    CONSTRAINT no_room_overlap EXCLUDE USING gist (
        sala_id WITH =, 
        tsrange(data_aula + hora_inicio, data_aula + hora_fim) WITH &&
    ),
    
    -- Validação: Formador não pode estar em dois sítios ao mesmo tempo
    CONSTRAINT no_teacher_overlap EXCLUDE USING gist (
        formador_id WITH =, 
        tsrange(data_aula + hora_inicio, data_aula + hora_fim) WITH &&
    )
);