import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import ScheduleCalendar from '../components/ScheduleCalendar';
import CreateLessonModal from '../components/CreateLessonModal';
import AutoScheduleModal from '../components/AutoScheduleModal';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Schedules = () => {
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('turma'); // 'turma', 'formador', 'sala'
    const [filterId, setFilterId] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [editEvent, setEditEvent] = useState(null);
    const [showAutoModal, setShowAutoModal] = useState(false);

    // Listas para os dropdowns
    const [turmas, setTurmas] = useState([]);
    const [formadores, setFormadores] = useState([]);
    const [salas, setSalas] = useState([]);

    const { user } = useAuth();
    const canManage = user && (user.is_admin || user.role === 'secretaria');
    const isTrainer = user && user.role === 'formador';

    // Carregar Opções dos Dropdowns (Turmas, Formadores, Salas)
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { token: token } };

                // Buscar Turmas
                const resTurmas = await axios.get('http://localhost:5000/classes', config);
                setTurmas(resTurmas.data);

                // Buscar formadores (apenas se tiver permissão de admin/secretaria)
                if (canManage) {
                    const resUsers = await axios.get('http://localhost:5000/admin/todos', config);
                    const listFormadores = resUsers.data.filter(u => u.role === 'formador');
                    setFormadores(listFormadores);
                }

                // Buscar salas
                const resSalas = await axios.get('http://localhost:5000/rooms', config);
                setSalas(resSalas.data);

            } catch (error) {
                console.error("Erro ao carregar filtros", error);
            }
        };
        fetchOptions();
        fetchSchedules(); // Load initial (all or filtered)
    }, []);

    // Quando troca de tab ou id, recarregar. 
    useEffect(() => {
        setFilterId(''); // Reset selection on tab change
    }, [activeTab]);

    useEffect(() => {
        fetchSchedules();
    }, [activeTab, filterId]);

    // Fetch de Horários
    const fetchSchedules = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { token: token },
                params: {
                    type: activeTab, // backend aceita 'turma', 'formador', 'sala'
                    id: filterId     // id da entidade selecionada
                }
            };

            const res = await axios.get('http://localhost:5000/schedules', config);

            // Converter strings de data para Objetos Date (necessário para o calendário)
            const formattedEvents = res.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));

            setEvents(formattedEvents);

        } catch (error) {
            console.error(error);
        }
    };

    // Handlers para o Calendário (Mantidos iguais)
    const handleSelectSlot = (slotInfo) => {
        setSelectedSlot(slotInfo);
        setShowModal(true);
    };

    const handleEventDrop = async ({ event, start, end }) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { token: token } };

            // Validação de Fim de Semana (Drag & Drop)
            const dayOfWeek = start.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                toast.error("Não é permitido agendar aulas ao fim de semana.");
                return;
            }

            const payload = {
                turma_id: event.turma_id,
                modulo_id: event.modulo_id,
                formador_id: event.formador_id,
                sala_id: event.sala_id,
                data_aula: start.toISOString().split('T')[0],
                hora_inicio: start.toTimeString().split(' ')[0],
                hora_fim: end.toTimeString().split(' ')[0]
            };

            await axios.put(`http://localhost:5000/schedules/${event.id}`, payload, config);
            toast.success("Horário atualizado!");
            fetchSchedules();

        } catch (error) {
            console.error(error);
            toast.error("Erro ao mover aula: " + (error.response?.data || error.message));
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedSlot(null);
        setEditEvent(event);
        setShowModal(true);
    };

    return (
        <Navbar>
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Consultas de Horários</h2>
                    <div className="d-flex gap-2">
                        {canManage && (
                            <button className="btn btn-primary-custom" onClick={() => setShowAutoModal(true)}>
                                Horário Automático
                            </button>
                        )}
                        {canManage && (
                            <button className="btn btn-success" onClick={() => {
                                setSelectedSlot(null);
                                setEditEvent(null);
                                setShowModal(true);
                            }}>
                                + Nova Aula
                            </button>
                        )}
                    </div>
                </div>

                <Card className="card-modern mb-4 p-3 border-0">
                    {/* Tabs Navigation - Ocultar para formandos */}
                    {user && user.role !== 'formando' && (
                        <ul className="nav nav-pills mb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'turma' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('turma')}
                                >
                                    Por Turma
                                </button>
                            </li>
                            <li className="nav-item">
                                {!isTrainer && (
                                    <button
                                        className={`nav-link ${activeTab === 'formador' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('formador')}
                                    >
                                        Por Formador
                                    </button>
                                )}
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'sala' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('sala')}
                                >
                                    Alocação de Sala
                                </button>
                            </li>
                        </ul>
                    )}

                    {/* Filtros - Ocultar para formandos */}
                    {user && user.role !== 'formando' && (
                        <Row className="g-3 align-items-end">
                            <Col md={12}>
                                {activeTab === 'turma' && (
                                    <>
                                        <Form.Label>Selecione a Turma para Consulta Rápida</Form.Label>
                                        <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                            <option value="">Selecione uma turma...</option>
                                            {turmas.map(t => <option key={t.id} value={t.id}>{t.codigo}</option>)}
                                        </Form.Select>
                                    </>
                                )}

                                {activeTab === 'formador' && (
                                    <>
                                        <Form.Label>Selecione o Formador</Form.Label>
                                        <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                            <option value="">Selecione um formador...</option>
                                            {formadores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                        </Form.Select>
                                    </>
                                )}

                                {activeTab === 'sala' && (
                                    <>
                                        <Form.Label>Selecione a Sala</Form.Label>
                                        <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                            <option value="">Selecione uma sala...</option>
                                            {salas.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.capacidade} lug.)</option>)}
                                        </Form.Select>
                                    </>
                                )}
                            </Col>
                        </Row>
                    )}
                </Card>

                <ScheduleCalendar
                    events={events}
                    onSelectSlot={canManage ? handleSelectSlot : undefined}
                    onSelectEvent={canManage ? handleSelectEvent : undefined}
                    onEventDrop={canManage ? handleEventDrop : undefined}
                    onEventResize={canManage ? handleEventDrop : undefined}
                    defaultView={activeTab === 'sala' ? 'day' : 'week'}
                    selectable={canManage}
                    resizable={canManage}
                />

                <CreateLessonModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    selectedSlot={selectedSlot}
                    editEvent={editEvent}
                    onSuccess={fetchSchedules}
                />

                <AutoScheduleModal
                    show={showAutoModal}
                    handleClose={() => setShowAutoModal(false)}
                    onSuccess={fetchSchedules}
                />
            </Container>
        </Navbar>
    );
};

export default Schedules;
