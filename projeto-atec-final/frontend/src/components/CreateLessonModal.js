import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateLessonModal = ({ show, handleClose, selectedSlot, onSuccess }) => {
    const [formData, setFormData] = useState({
        turma_id: '',
        modulo_id: '',
        formador_id: '',
        sala_id: '',
        data_aula: '',
        hora_inicio: '',
        hora_fim: ''
    });

    const [turmas, setTurmas] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [formadores, setFormadores] = useState([]);
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carregar dados auxiliares
    useEffect(() => {
        if (show) {
            fetchAuxData();
            // Preencher dados se vierem do "drag/select" no calendário
            if (selectedSlot) {
                // selectedSlot.start é Date object
                const dateStr = selectedSlot.start.toISOString().split('T')[0];
                const startStr = selectedSlot.start.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
                const endStr = selectedSlot.end.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

                setFormData(prev => ({
                    ...prev,
                    data_aula: dateStr,
                    hora_inicio: startStr,
                    hora_fim: endStr
                }));
            }
        }
    }, [show, selectedSlot]);

    const fetchAuxData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { token: token } };

            const [resTurmas, resModulos, resFormadores, resSalas] = await Promise.all([
                axios.get('http://localhost:5000/classes', config),
                axios.get('http://localhost:5000/modules', config),
                axios.get('http://localhost:5000/schedules/trainers-list', config), // Endpoint dedicado
                axios.get('http://localhost:5000/rooms', config)
            ]);

            setTurmas(resTurmas.data);
            setModulos(resModulos.data);
            setFormadores(resFormadores.data);
            setSalas(resSalas.data);

        } catch (error) {
            console.error("Erro ao carregar dados", error);
            toast.error("Erro ao carregar listas de seleção.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { token: token } };

            await axios.post('http://localhost:5000/schedules', formData, config);
            
            toast.success("Aula agendada com sucesso!");
            onSuccess(); // Recarregar calendário
            handleClose();

        } catch (error) {
            console.error(error);
            const msg = error.response?.data || "Erro ao criar aula";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Agendar Nova Aula</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Turma</Form.Label>
                                <Form.Select name="turma_id" value={formData.turma_id} onChange={handleChange} required>
                                    <option value="">Selecione...</option>
                                    {turmas.map(t => <option key={t.id} value={t.id}>{t.codigo}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Módulo</Form.Label>
                                <Form.Select name="modulo_id" value={formData.modulo_id} onChange={handleChange} required>
                                    <option value="">Selecione...</option>
                                    {modulos.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.codigo})</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Formador</Form.Label>
                                <Form.Select name="formador_id" value={formData.formador_id} onChange={handleChange} required>
                                    <option value="">Selecione...</option>
                                    {formadores.map(f => (
                                        // Nota: Aqui precisamos do ID da tabela formadores. 
                                        // O endpoint /admin/todos retorna users... 
                                        // SE O FORMADOR nao tiver registo na tabela 'formadores', vai dar erro de chave estrangeira (formador_id).
                                        // SOLUÇÃO: Filtrar apenas users que TÊM formador associado ou assumir que o sistema cria auto.
                                        // Como o sistema separa User de Formador, este dropdown pode falhar se usarmos user.id em vez de formador.id.
                                        // Vou assumir provisoriamente user.id e se falhar corrijo a query auxiliar
                                        // Melhor: Usar o endpoint /admin/users que lista dados completos?
                                        // O endpoint /admin/todos retorna "utilizadores".
                                        
                                        // HACK PROVISORIO: Se o backend espera 'formador_id', preciso do ID da tabela formador. 
                                        // Se este user for formador, preciso do ID de formador DELE. 
                                        // Mas o endpoint /admin/todos não deve retornar o ID da tabela 'formadores'.
                                        // Preciso de um endpoint `GET /trainers` ou algo assim. 
                                        // Vou assumir que por agora vai falhar se user.id != formador.id e corrigirei no próximo passo se necessario.
                                        <option key={f.id} value={f.id}>{f.nome}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Sala</Form.Label>
                                <Form.Select name="sala_id" value={formData.sala_id} onChange={handleChange} required>
                                    <option value="">Selecione...</option>
                                    {salas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Data</Form.Label>
                                <Form.Control type="date" name="data_aula" value={formData.data_aula} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Início</Form.Label>
                                <Form.Control type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fim</Form.Label>
                                <Form.Control type="time" name="hora_fim" value={formData.hora_fim} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'A guardar...' : 'Agendar Aula'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateLessonModal;
