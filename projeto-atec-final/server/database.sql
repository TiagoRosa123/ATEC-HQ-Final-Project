-- 1. LIMPEZA TOTAL
DROP TABLE IF EXISTS ficheiros CASCADE;

DROP TABLE IF EXISTS avaliacoes CASCADE;

DROP TABLE IF EXISTS horarios CASCADE;

DROP TABLE IF EXISTS inscricoes CASCADE;

DROP TABLE IF EXISTS turmas_modulos CASCADE;

DROP TABLE IF EXISTS turmas CASCADE;

DROP TABLE IF EXISTS disponibilidades CASCADE;

DROP TABLE IF EXISTS competencias_formador CASCADE;

DROP TABLE IF EXISTS funcionarios CASCADE;

DROP TABLE IF EXISTS formandos CASCADE;

DROP TABLE IF EXISTS formadores CASCADE;

DROP TABLE IF EXISTS curso_modulos CASCADE;

DROP TABLE IF EXISTS modulos CASCADE;

DROP TABLE IF EXISTS cursos CASCADE;

DROP TABLE IF EXISTS salas CASCADE;

DROP TABLE IF EXISTS areas CASCADE;

DROP TABLE IF EXISTS utilizadores CASCADE;

DROP TYPE IF EXISTS role_enum CASCADE;

DROP TYPE IF EXISTS departamento_enum CASCADE;

DROP TYPE IF EXISTS cargo_enum CASCADE;

DROP TYPE IF EXISTS tipo_avaliacao_enum CASCADE;

DROP TYPE IF EXISTS tipo_ficheiro_enum CASCADE;

DROP TYPE IF EXISTS estado_turma_enum CASCADE;

DROP TYPE IF EXISTS estado_inscricao_enum CASCADE;

DROP TYPE IF EXISTS estado_salas_enum CASCADE;

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1 Utilizadores
CREATE TYPE role_enum AS ENUM (
    'admin', 
    'formador', 
    'formando', 
    'user',
	'funcionario',
	'secretaria'
);

CREATE TABLE utilizadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(40) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT,
    role role_enum DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    ativado BOOLEAN DEFAULT FALSE,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP,
    two_fa_secret TEXT,
    two_fa_ativado BOOLEAN DEFAULT FALSE,
    foto TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2 Áreas
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT
);

-- 3 Salas
CREATE TYPE estado_salas_enum AS ENUM (
    'disponivel', 
    'indisponivel'
);

CREATE TABLE salas (
    id SERIAL PRIMARY KEY,
    area_id INT REFERENCES areas (id),
    nome VARCHAR(40) NOT NULL,
    capacidade INT NOT NULL,
    recursos TEXT NOT NULL,
    estado estado_salas_enum NOT NULL
);

-- 4 Cursos
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    area_id INT REFERENCES areas (id),
    nome VARCHAR(50) NOT NULL,
    sigla VARCHAR(10),
    descricao TEXT,
    imagem TEXT,
    duracao_horas INT
);

-- 5 Módulos
CREATE TABLE modulos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    horas_totais INT NOT NULL,
    codigo VARCHAR(10)
);

-- 6 Estrutura do Curso
CREATE TABLE curso_modulos (
    id SERIAL PRIMARY KEY,
    curso_id INT REFERENCES cursos (id) ON DELETE CASCADE,
    modulo_id INT REFERENCES modulos (id) ON DELETE CASCADE,
    ordem_sequencia INT -- P/ ordenar visivelmente
);

-- 7 Formadores
CREATE TABLE formadores (
    id SERIAL PRIMARY KEY,
    utilizador_id INT REFERENCES utilizadores (id) ON DELETE CASCADE,
    nome VARCHAR(40) NOT NULL,
    cor_calendario VARCHAR(7) -- cor p/ formador para melhor visualização Frontend
);

-- 8 Formandos
CREATE TABLE formandos (
    id SERIAL PRIMARY KEY,
    utilizador_id INT REFERENCES utilizadores (id) ON DELETE CASCADE,
    nome VARCHAR(40) NOT NULL
);

-- 9 Funcionários
CREATE TYPE departamento_enum AS ENUM (
    'Secretaria', 
    'Administracao', 
    'Recursos Humanos', 
    'Financas'
);

CREATE TYPE cargo_enum AS ENUM (
    'Diretor', 
    'Assistente', 
    'Tecnico', 
    'Coordenador'
);

CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    utilizador_id INT REFERENCES utilizadores (id) ON DELETE CASCADE,
    nome VARCHAR(40) NOT NULL,
    departamento departamento_enum NOT NULL,
    cargo cargo_enum NOT NULL
);

-- 10 Competências dos Formadores
CREATE TABLE competencias_formador (
    id SERIAL PRIMARY KEY,
    formador_id INT REFERENCES formadores (id) ON DELETE CASCADE,
    modulo_id INT REFERENCES modulos (id) ON DELETE CASCADE,
    UNIQUE (formador_id, modulo_id)
);

-- 11 Disponibilidades
CREATE TABLE disponibilidades (
    id SERIAL PRIMARY KEY,
    formador_id INT REFERENCES formadores (id) ON DELETE CASCADE,
    data_inicio TIMESTAMP
    WITH
        TIME ZONE NOT NULL, -- data + hora 
        data_fim TIMESTAMP
    WITH
        TIME ZONE NOT NULL,
        observacoes TEXT
);

-- 12 Turmas
CREATE TYPE estado_turma_enum AS ENUM (
    'planeamento', 
    'ativa',       
    'concluida',   
    'cancelada' 
);

CREATE TABLE turmas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    curso_id INT REFERENCES cursos (id),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    coordenador_id INT REFERENCES formadores (id),
    estado estado_turma_enum
);

-- 13 Turmas modulos
CREATE TABLE turmas_modulos (
    id SERIAL PRIMARY KEY,
    formador_id INT REFERENCES formadores (id) ON DELETE CASCADE,
    modulo_id INT REFERENCES modulos (id) ON DELETE CASCADE,
    turmas_id INT REFERENCES turmas (id) ON DELETE CASCADE,
    UNIQUE (turmas_id, modulo_id)
);

-- 14 Inscrições
CREATE TYPE estado_inscricao_enum AS ENUM (
    'ativa',    
    'cancelada', 
    'pendente',   
    'concluido'  
);

CREATE TABLE inscricoes (
    id SERIAL PRIMARY KEY,
    turma_id INT REFERENCES turmas (id) ON DELETE CASCADE,
    formando_id INT REFERENCES formandos (id) ON DELETE CASCADE,
    data_inscricao DATE DEFAULT CURRENT_DATE,
    estado estado_inscricao_enum DEFAULT 'ativa',
    UNIQUE (turma_id, formando_id)
);

-- 15 Horários
CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,
    turma_id INT REFERENCES turmas (id) ON DELETE CASCADE,
    modulo_id INT REFERENCES modulos (id),
    formador_id INT REFERENCES formadores (id),
    sala_id INT REFERENCES salas (id),
    data_aula DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    CONSTRAINT no_room_overlap EXCLUDE USING gist (
        sala_id
        WITH
            =,
            tsrange (
                data_aula + hora_inicio,
                data_aula + hora_fim
            )
        WITH
            &&
    ),
    CONSTRAINT no_teacher_overlap EXCLUDE USING gist (
        formador_id
        WITH
            =,
            tsrange (
                data_aula + hora_inicio,
                data_aula + hora_fim
            )
        WITH
            &&
    ),
    CONSTRAINT no_class_overlap EXCLUDE USING gist (
        turma_id
        WITH
            =,
            tsrange (
                data_aula + hora_inicio,
                data_aula + hora_fim
            )
        WITH
            &&
    )
);

-- 16 Avaliações
CREATE TYPE tipo_avaliacao_enum AS ENUM (
    'Teste', 
    'Projeto Final', 
    'Apresentação Oral', 
    'Recuperacao',
    'Estagio'
);

CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    turma_id INT REFERENCES turmas (id) ON DELETE CASCADE,
    modulo_id INT REFERENCES modulos (id) ON DELETE CASCADE,
    formando_id INT REFERENCES formandos (id) ON DELETE CASCADE,
    nota DECIMAL(4, 2) NOT NULL,
    data_avaliacao DATE NOT NULL,
    tipo_avaliacao tipo_avaliacao_enum NOT NULL, -- enum
    observacoes TEXT
);

-- 17 Ficheiros
CREATE TYPE tipo_ficheiro_enum AS ENUM (
    'Curriculum Vitae', 
    'Registo Criminal', 
    'Bolsa de Formação', 
    'Certificado de Habilitações',
    'Comprovativo de IBAN',
    'Outros'
);

CREATE TABLE ficheiros (
    id SERIAL PRIMARY KEY,
    formador_id INT REFERENCES formadores(id) ON DELETE CASCADE, 
    formando_id INT REFERENCES formandos(id) ON DELETE CASCADE,
	funcionario_id INT REFERENCES funcionarios(id) ON DELETE CASCADE,
	nome_ficheiro VARCHAR(50) NOT NULL,
    tipo_ficheiro tipo_ficheiro_enum NOT NULL, --enum
	mime_type VARCHAR(100), -- saber qual icone mostra no frontend
	tamanho_bytes BIGINT, -- ex.: application/pdf
	data_upload DATE DEFAULT CURRENT_TIMESTAMP,
	-- Garante que o ficheiro pertence a UMA e só UMA entidade
    CONSTRAINT ficheiro_um_dono CHECK (
        (formador_id IS NOT NULL)::int +
        (formando_id IS NOT NULL)::int +
        (funcionario_id IS NOT NULL)::int = 1
    )
);