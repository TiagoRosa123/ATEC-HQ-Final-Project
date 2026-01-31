-- ADICIONADO EM MIGRACAO: Campo foto_perfil
ALTER TABLE utilizadores ADD COLUMN foto_perfil TEXT;

-- NOVA MIGRACAO: Atualizar o ENUM de tipos de ficheiro (Isto no Postgres requer passos extra)
-- Passo 1: Renomear o tipo antigo
ALTER TYPE tipo_ficheiro_enum RENAME TO tipo_ficheiro_enum_old;

-- Passo 2: Criar o novo tipo com todas as opções + 'Foto de Perfil'
CREATE TYPE tipo_ficheiro_enum AS ENUM (
    'Curriculum Vitae', 
    'Registo Criminal', 
    'Bolsa de Formação', 
    'Certificado de Habilitações',
    'Comprovativo de IBAN',
    'Avaliação',
    'Foto de Perfil', -- NOVO
    'Outros'
);

-- Passo 3: Atualizar a tabela para usar o novo tipo
ALTER TABLE ficheiros 
  ALTER COLUMN tipo_ficheiro TYPE tipo_ficheiro_enum 
  USING tipo_ficheiro::text::tipo_ficheiro_enum;

-- Passo 4: Apagar o tipo antigo
DROP TYPE tipo_ficheiro_enum_old;
