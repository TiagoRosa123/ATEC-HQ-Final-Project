# ATEC HQ - Plataforma de Gestão de Formação

Este projeto é uma Aplicação Web para gestão de uma academia de formação, permitindo a gestão de turmas, horários, avaliações e recursos.

## Pré-requisitos

Para executar este projeto, necessita de ter instalado:
- **Docker Desktop** (Recomendado)
- **Node.js** (Apenas se quiser correr localmente sem Docker)
- **PostgreSQL** (Caso não use o container de base de dados - *Ver nota abaixo*)

## Como Executar (Docker)

A forma mais simples de testar a aplicação é utilizando o Docker Compose via terminal na pasta raiz:

1. **Configurar Variáveis de Ambiente**
   - Verifique o ficheiro `.env` na raiz ou `docker-compose.yml` para confirmar as credenciais da base de dados.

2. **Arrancar a Aplicação**
   ```bash
   docker-compose up --build
   ```

3. **Aceder à Aplicação**
   - Frontend: [http://localhost](http://localhost) (Porta 80)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## Base de Dados

O projeto está configurado para ligar a uma base de dados PostgreSQL.
- Os scripts de criação das tabelas encontram-se em: `server/database.sql`
- Dados de teste (Seeds) encontram-se em: `server/seed_data.sql`

> **Nota:** Se o `docker-compose.yml` não incluir um serviço `db`, certifique-se que tem um Postgres a correr localmente e que as credenciais no `server/.env` ou `docker-compose.yml` apontam para ele (`host.docker.internal` para Windows/Mac).

## Tecnologias Utilizadas

- **Frontend:** React.js, React Bootstrap, FullCalendar
- **Backend:** Node.js, Express
- **Base de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Tokens)

## Credenciais de Teste (Exemplo)

- **Admin:** `admin@atec.pt` / `123456` (Se carregados os seeds)
- **Formador:** `formador@atec.pt` / `123456`
- **Formando:** `aluno@atec.pt` / `123456`

Desenvolvido por **Hugo Bacalhau** e **Tiago Rosa**.
