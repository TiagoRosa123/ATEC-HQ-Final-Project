--
-- PostgreSQL database dump
--

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;

SET session_replication_role = 'replica';

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = on;

SELECT pg_catalog.set_config ('search_path', '', false);

SET check_function_bodies = false;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = off;

--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.areas VALUES ( 1, 'informatica', 'Programaçao' );

INSERT INTO
    public.areas
VALUES (
        2,
        'Informática',
        'Cursos de TI e Programação'
    );

INSERT INTO
    public.areas
VALUES (
        3,
        'Mecânica',
        'Mecatrónica e Automóvel'
    );

INSERT INTO
    public.areas
VALUES (
        4,
        'Eletrónica',
        'Automação e Robótica'
    );

--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO
    public.cursos
VALUES (
        1,
        1,
        'Programacao',
        'PC',
        'dadada',
        NULL,
        NULL
    );

INSERT INTO
    public.cursos
VALUES (
        2,
        2,
        'TPSI Cibersegurança',
        NULL,
        'Especialização em segurança de redes e sistemas.',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070',
        1200
    );

INSERT INTO
    public.cursos
VALUES (
        3,
        2,
        'TPSI Programação',
        NULL,
        'Desenvolvimento de software web e mobile.',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072',
        1200
    );

INSERT INTO
    public.cursos
VALUES (
        4,
        3,
        'Mecatrónica Automóvel',
        NULL,
        'Manutenção e diagnóstico de veículos modernos.',
        'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=2000',
        1200
    );

INSERT INTO
    public.cursos
VALUES (
        5,
        4,
        'Automação e Robótica',
        NULL,
        'Programação de robots e autómatos.',
        'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=1974',
        1200
    );

INSERT INTO
    public.cursos
VALUES (
        6,
        2,
        'Redes e Sistemas',
        NULL,
        'Administração de redes e servidores.',
        'https://images.unsplash.com/photo-1544197150-b99a580bbc7f?auto=format&fit=crop&q=80&w=2000',
        1200
    );

INSERT INTO
    public.cursos
VALUES (
        7,
        3,
        'Soldador',
        'SD',
        'SOldadura',
        'C:\Users\Utilizador\Desktop\ProjetoFinalATEC\projeto-atec-final\frontend\public\assets\el-soldar-con-las-chispas-99549723.webp',
        1400
    );

--
-- Data for Name: utilizadores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO
    public.utilizadores
VALUES (
        2,
        'Joao Manel',
        'tiagoandre_12@hotmail.com',
        '$2b$10$c2eFir8Kn2JAV.SAZdXS6eCv6BDDxP6u6td0XpzmaNkBBi8gG1Uea',
        'formador',
        false,
        true,
        NULL,
        NULL,
        NULL,
        false,
        '2026-01-28 22:25:36.790984'
    );

INSERT INTO
    public.utilizadores
VALUES (
        1,
        'Tiago Rosa',
        'tiago.rosa.t0130956@edu.atec.pt',
        '$2b$10$OJolQIHcL9Hv4W8m9oiycu/MlTmP4wFZnuj1TT0TZjnl.GQiUP6SK',
        'admin',
        true,
        true,
        NULL,
        NULL,
        'JRQVMUDPF5WVEVZQKBLFCW3IOBLEU525',
        false,
        '2026-01-28 18:15:02.490328'
    );

INSERT INTO
    public.utilizadores
VALUES (
        6,
        'andre miguel',
        'taguinhoandre123@gmail.com',
        '$2b$10$txXgh3v62Q9LwO5w9756A.gtAX6PsyUuRvyAlGyK.eVdUkFXt2c3C',
        'formando',
        false,
        true,
        NULL,
        NULL,
        NULL,
        false,
        '2026-02-09 21:25:39.666174'
    );

--
-- Data for Name: formadores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.formadores VALUES (1, 2, 'Joao Manel', NULL);

--
-- Data for Name: formandos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.formandos VALUES (3, 6, 'andre miguel');

--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.modulos VALUES (1, 'C++', 50, '613');

--
-- Data for Name: turmas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO
    public.turmas
VALUES (
        1,
        '0525',
        1,
        '2025-01-28',
        '2026-02-28',
        NULL,
        'ativa'
    );

INSERT INTO
    public.turmas
VALUES (
        2,
        '1234',
        7,
        '2026-02-18',
        '2026-12-31',
        NULL,
        'concluida'
    );

--
-- Data for Name: avaliacoes; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: competencias_formador; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: curso_modulos; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: disponibilidades; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: funcionarios; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: ficheiros; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO
    public.horarios
VALUES (
        7,
        1,
        NULL,
        1,
        1,
        '2026-01-31',
        '17:00:00',
        '19:00:00'
    );

INSERT INTO
    public.horarios
VALUES (
        8,
        1,
        1,
        1,
        1,
        '2026-02-01',
        '12:30:00',
        '15:30:00'
    );

INSERT INTO
    public.horarios
VALUES (
        3,
        1,
        1,
        1,
        1,
        '2026-01-28',
        '16:00:00',
        '18:30:00'
    );

INSERT INTO
    public.horarios
VALUES (
        1,
        1,
        1,
        1,
        1,
        '2026-01-30',
        '13:00:00',
        '15:00:00'
    );

INSERT INTO
    public.horarios
VALUES (
        9,
        1,
        1,
        1,
        1,
        '2026-02-03',
        '10:00:00',
        '10:30:00'
    );

INSERT INTO
    public.horarios
VALUES (
        10,
        1,
        1,
        1,
        1,
        '2026-02-03',
        '13:30:00',
        '14:00:00'
    );

--
-- Data for Name: inscricoes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO
    public.inscricoes
VALUES (
        7,
        1,
        3,
        '2026-02-09',
        'ativa'
    );

--
-- Data for Name: salas; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: turmas_modulos; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Name: areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.areas_id_seq', 7, true );

--
-- Name: avaliacoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.avaliacoes_id_seq', 1, false );

--
-- Name: competencias_formador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval (
        'public.competencias_formador_id_seq', 1, false
    );

--
-- Name: curso_modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.curso_modulos_id_seq', 1, false );

--
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.cursos_id_seq', 7, true );

--
-- Name: disponibilidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval (
        'public.disponibilidades_id_seq', 1, false
    );

--
-- Name: ficheiros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.ficheiros_id_seq', 1, false );

--
-- Name: formadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.formadores_id_seq', 1, true );

--
-- Name: formandos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.formandos_id_seq', 3, true );

--
-- Name: funcionarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.funcionarios_id_seq', 1, false );

--
-- Name: horarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.horarios_id_seq', 10, true );

--
-- Name: inscricoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.inscricoes_id_seq', 7, true );

--
-- Name: modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.modulos_id_seq', 1, true );

--
-- Name: salas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.salas_id_seq', 1, false );

--
-- Name: turmas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.turmas_id_seq', 2, true );

--
-- Name: turmas_modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval (
        'public.turmas_modulos_id_seq', 1, false
    );

--
-- Name: utilizadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval ( 'public.utilizadores_id_seq', 14, true );

--
-- NOVOS DADOS ADICIONADOS (DEMO)
--

-- 1. Novos Utilizadores (Formandos)
INSERT INTO public.utilizadores (id, nome, email, password_hash, role, ativado, is_admin) VALUES
(10, 'Maria Silva', 'maria.silva@atec.pt', '$2b$10$OJolQIHcL9Hv4W8m9oiycu/MlTmP4wFZnuj1TT0TZjnl.GQiUP6SK', 'formando', true, false),
(11, 'Jose Santos', 'jose.santos@atec.pt', '$2b$10$OJolQIHcL9Hv4W8m9oiycu/MlTmP4wFZnuj1TT0TZjnl.GQiUP6SK', 'formando', true, false),
(12, 'Ana Pereira', 'ana.pereira@atec.pt', '$2b$10$OJolQIHcL9Hv4W8m9oiycu/MlTmP4wFZnuj1TT0TZjnl.GQiUP6SK', 'formando', true, false),
(13, 'Pedro Costa', 'pedro.costa@atec.pt', '$2b$10$OJolQIHcL9Hv4W8m9oiycu/MlTmP4wFZnuj1TT0TZjnl.GQiUP6SK', 'formando', true, false);

-- 2. Tabela Formandos
INSERT INTO public.formandos (id, utilizador_id, nome) VALUES
(10, 10, 'Maria Silva'),
(11, 11, 'Jose Santos'),
(12, 12, 'Ana Pereira'),
(13, 13, 'Pedro Costa');

-- 3. Inscrever na Turma 1 (0525) - Ativa
INSERT INTO public.inscricoes (turma_id, formando_id, estado) VALUES
(1, 10, 'ativa'),
(1, 11, 'ativa'),
(1, 12, 'ativa'),
(1, 13, 'ativa');

-- Atualizar sequências para garantir que novos inserts não falhem
SELECT pg_catalog.setval('public.utilizadores_id_seq', (SELECT MAX(id) FROM public.utilizadores), true);
SELECT pg_catalog.setval('public.formandos_id_seq', (SELECT MAX(id) FROM public.formandos), true);
SELECT pg_catalog.setval('public.inscricoes_id_seq', (SELECT MAX(id) FROM public.inscricoes), true);

--
-- PostgreSQL database dump complete
--
SET session_replication_role = 'DEFAULT';