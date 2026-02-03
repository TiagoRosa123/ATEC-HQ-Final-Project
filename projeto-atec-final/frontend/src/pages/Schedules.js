import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import ScheduleCalendar from '../components/ScheduleCalendar';
import CreateLessonModal from '../components/CreateLessonModal'; // Importar
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Schedules = () => {
    const [events, setEvents] = useState([]);
    const [filterType, setFilterType] = useState(''); // 'turma', 'formador', 'sala'
    const [filterId, setFilterId] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [editEvent, setEditEvent] = useState(null); // Novo estado

    // Listas para os dropdowns
    const [cursos, setCursos] = useState([]);
    const [formadores, setFormadores] = useState([]);
    const [salas, setSalas] = useState([]);

    // ... (useEffect e handlers de filtro existentes mantidos, mas omitidos aqui para brevidade se não mudarem, ou incluídos se eu substituir o ficheiro todo.
    // Como estou a substituir o componente todo (ou grande parte), vou ter de reincluir tudo ou usar replace parcial com cuidado.)

    // Melhor: Substituir o corpo do componente para incluir as novas funções.

    // Carregar opções dos filtros ao iniciar
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { token: token } };

                // Buscar cursos
                const resCursos = await axios.get('http://localhost:5000/courses', config);
                setCursos(resCursos.data);

                // Buscar formadores (rota admin)
                const resUsers = await axios.get('http://localhost:5000/admin/todos', config);
                const listFormadores = resUsers.data.filter(u => u.role === 'formador');
                setFormadores(listFormadores);

                // Buscar salas
                const resSalas = await axios.get('http://localhost:5000/rooms', config);
                setSalas(resSalas.data);

            } catch (error) {
                console.error("Erro ao carregar filtros", error);
            }
        };
        fetchOptions();
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { token: token },
                params: {
                    type: filterType,
                    id: filterId
                }
            };

            const res = await axios.get('http://localhost:5000/schedules', config);

            const formattedEvents = res.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                // Para D&D, precisamos de acesso aos IDs originais
                // Já vem no 'event' se o backend mandar
            }));

            setEvents(formattedEvents);

        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data || error.message;
            toast.error("Erro ao atualizar calendário: " + errMsg);
        }
    };

    useEffect(() => {
        if ((filterType && filterId) || (!filterType && !filterId)) {
            fetchSchedules();
        }
    }, [filterType, filterId]);

    // Handlers para o Calendário
    const handleSelectSlot = (slotInfo) => {
        // Apenas permitir criar se o user for Admin (idealmente validar via role, mas aqui simplicamos)
        // Para já, abre o modal.
        setSelectedSlot(slotInfo);
        setShowModal(true);
    };

    const handleEventDrop = async ({ event, start, end }) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { token: token } };

            // Preparar payload para update
            // Nota: event.resource tem os nomes, mas precisamos dos IDs originais.
            // O backend deve retornar os IDs. Vou verificar se 'schedules.js' retorna turma_id, sala_id, etc.
            // Sim, retorna h.turma_id, h.formador_id, h.sala_id. Estão na raiz do objeto ou em resource?
            // Verifiquei schedules.js: retorna na raiz (row.turma_id etc).
            // O frontend map colocou-os em ...event, então estão acessíveis.

            const payload = {
                turma_id: event.turma_id,
                modulo_id: event.modulo_id, // Precisamos ter certeza que modulo_id vem do backend (não vi no SELECT)
                // Vou ter de adicionar modulo_id ao SELECT do backend se faltar.
                // Verifiquei: "h.turma_id, h.formador_id, h.sala_id" estavam lá. "h.modulo_id"? 
                // Vou verificar o backend novamente. Se faltar, adiciono.
                formador_id: event.formador_id,
                sala_id: event.sala_id,
                data_aula: start.toISOString().split('T')[0],
                hora_inicio: start.toTimeString().split(' ')[0], // HH:MM:SS
                hora_fim: end.toTimeString().split(' ')[0]
            };

            await axios.put(`http://localhost:5000/schedules/${event.id}`, payload, config);
            toast.success("Horário atualizado!");
            fetchSchedules(); // Refresh

        } catch (error) {
            console.error(error);
            toast.error("Erro ao mover aula: " + (error.response?.data || error.message));
        }
    };

    const handleSelectEvent = (event) => {
        // Modo Edição
        setSelectedSlot(null);
        setEditEvent(event);
        setShowModal(true);
    };

    return (
        <Navbar>
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Gestão de Horários</h2>
                    <button className="btn btn-success" onClick={() => {
                        setSelectedSlot(null);
                        setEditEvent(null);
                        setShowModal(true);
                    }}>
                        + Nova Aula
                    </button>
                </div>

                <Card className="card-modern mb-4 p-3 border-0">
                    <Row className="g-3 align-items-end">
                        <Col md={3}>
                            <Form.Label>Filtrar por</Form.Label>
                            <Form.Select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setFilterId('');
                                }}
                            >
                                <option value="">Todos os Horários</option>
                                <option value="curso">Curso</option>
                                <option value="formador">Formador</option>
                                <option value="sala">Sala</option>
                            </Form.Select>
                        </Col>

                        {filterType === 'curso' && (
                            <Col md={4}>
                                <Form.Label>Selecione o Curso</Form.Label>
                                <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.sigla})</option>)}
                                </Form.Select>
                            </Col>
                        )}

                        {filterType === 'formador' && (
                            <Col md={4}>
                                <Form.Label>Formador</Form.Label>
                                <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {formadores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </Form.Select>
                            </Col>
                        )}

                        {filterType === 'sala' && (
                            <Col md={4}>
                                <Form.Label>Sala</Form.Label>
                                <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {salas.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.capacidade} lug.)</option>)}
                                </Form.Select>
                            </Col>
                        )}

                        <Col md={2}>
                            <button className="btn btn-primary w-100" onClick={fetchSchedules}>
                                Atualizar
                            </button>
                        </Col>
                    </Row>
                </Card>

                <ScheduleCalendar
                    events={events}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent} // Novo handler para click no evento
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventDrop}
                />

                <CreateLessonModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    selectedSlot={selectedSlot}
                    editEvent={editEvent} // Passar evento para edição
                    onSuccess={fetchSchedules}
                />
            </Container>
        </Navbar>
    );
};

export default Schedules;
