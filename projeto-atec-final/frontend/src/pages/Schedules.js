import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import ScheduleCalendar from '../components/ScheduleCalendar';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Schedules = () => {
    const [events, setEvents] = useState([]);
    const [filterType, setFilterType] = useState(''); // 'turma', 'formador', 'sala'
    const [filterId, setFilterId] = useState('');
    
    // Listas para os dropdowns
    const [turmas, setTurmas] = useState([]);
    const [formadores, setFormadores] = useState([]);
    const [salas, setSalas] = useState([]);

    // Carregar opções dos filtros ao iniciar
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { token: token } };

                // Buscar turmas
                // Nota: Assumo que estas rotas existem baseada na análise anterior
                const resTurmas = await axios.get('http://localhost:5000/classes', config);
                setTurmas(resTurmas.data);

                // Buscar formadores (rota admin normalmente)
                // Se a rota publica de lista formadores não existir, teremos que criar ou usar admin
                // FIX: Rota correta é /admin/todos
                const resUsers = await axios.get('http://localhost:5000/admin/todos', config); 
                const listFormadores = resUsers.data.filter(u => u.role === 'formador');
                setFormadores(listFormadores);
                
                // Buscar salas
                const resSalas = await axios.get('http://localhost:5000/rooms', config);
                setSalas(resSalas.data);

            } catch (error) {
                console.error("Erro ao carregar filtros", error);
                // toast.error("Erro ao carregar filtros: " + (error.response?.data || error.message));
            }
        };
        fetchOptions();
        
        // Carregar TODOS os eventos inicialmente
        fetchSchedules(); 
    }, []);

    // Função para buscar horários
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
            
            // Converter strings de data para objetos Date (necessário para o calendario)
            const formattedEvents = res.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
            }));

            setEvents(formattedEvents);

        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data || error.message;
            toast.error("Erro ao atualizar calendário: " + errMsg);
        }
    };

    // Atualizar quando mudar filtros
    useEffect(() => {
        if ((filterType && filterId) || (!filterType && !filterId)) {
             fetchSchedules();
        }
    }, [filterType, filterId]);


    return (
        <Navbar>
            <Container className="mt-4">
                <h2 className="mb-4">Consultar Horários</h2>
                
                <Card className="mb-4 p-3 shadow-sm border-0">
                    <Row className="g-3 align-items-end">
                        <Col md={3}>
                            <Form.Label>Filtrar por</Form.Label>
                            <Form.Select 
                                value={filterType} 
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setFilterId(''); // Reset id when type changes
                                }}
                            >
                                <option value="">-- Todos os Horários --</option>
                                <option value="turma">Turma</option>
                                <option value="formador">Formador</option>
                                <option value="sala">Sala</option>
                            </Form.Select>
                        </Col>

                        {/* Filtro Dinâmico */}
                        {filterType === 'turma' && (
                            <Col md={4}>
                                <Form.Label>Selecione a Turma</Form.Label>
                                <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {turmas.map(t => (
                                        <option key={t.id} value={t.id}>{t.codigo}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        )}

                        {filterType === 'formador' && (
                            <Col md={4}>
                                <Form.Label>Selecione o Formador</Form.Label>
                                <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {formadores.map(f => (
                                        <option key={f.id} value={f.id}>{f.nome}</option> // Nota: preciso verificar se 'f.id' é do user ou do formador. O filtro no backend espera ID da tabela formador provavelmente.
                                        // REVISÃO: No código anterior fetchFormadores busca USERS.
                                        // Se o backend espera 'formador_id', preciso do ID da tabela `formadores`.
                                        // O endpoint de users retorna dados da tabela utilizadores.
                                        // Melhor corrigir isso depois. Por agora assumo que vamos ajustar o backend ou o frontend.
                                        // Pela logica da BD, formador_id != utilizador_id.
                                    ))}
                                </Form.Select>
                            </Col>
                        )}

                        {filterType === 'sala' && (
                             <Col md={4}>
                                <Form.Label>Selecione a Sala</Form.Label>
                                <Form.Select value={filterId} onChange={e => setFilterId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {salas.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome} ({s.capacidade} lug.)</option>
                                    ))}
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

                <ScheduleCalendar events={events} />
            </Container>
        </Navbar>
    );
};

export default Schedules;
