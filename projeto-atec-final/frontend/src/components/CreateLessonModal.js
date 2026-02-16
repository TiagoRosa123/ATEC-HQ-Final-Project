import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateLessonModal = ({ show, handleClose, selectedSlot, editEvent, onSuccess }) => {
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

            if (editEvent) {
                // Modo Edição: Preencher com dados existentes
                setFormData({
                    turma_id: editEvent.turma_id || '',
                    modulo_id: editEvent.modulo_id || '',
                    formador_id: editEvent.formador_id || '',
                    sala_id: editEvent.sala_id || '',
                    data_aula: editEvent.start ? editEvent.start.toISOString().split('T')[0] : '',
                    hora_inicio: editEvent.start ? editEvent.start.toTimeString().split(' ')[0].substring(0, 5) : '',
                    hora_fim: editEvent.end ? editEvent.end.toTimeString().split(' ')[0].substring(0, 5) : ''
                });
            } else if (selectedSlot) {
                // Modo Criação (Drag/Select)
                const dateStr = selectedSlot.start.toISOString().split('T')[0];
                const startStr = selectedSlot.start.toTimeString().split(' ')[0].substring(0, 5);
                const endStr = selectedSlot.end.toTimeString().split(' ')[0].substring(0, 5);

                setFormData({
                    turma_id: '',
                    modulo_id: '',
                    formador_id: '',
                    sala_id: '',
                    data_aula: dateStr,
                    hora_inicio: startStr,
                    hora_fim: endStr
                });
            } else {
                // Reset
                setFormData({
                    turma_id: '',
                    modulo_id: '',
                    formador_id: '',
                    sala_id: '',
                    data_aula: '',
                    hora_inicio: '',
                    hora_fim: ''
                });
            }
        }
    }, [show, selectedSlot, editEvent]);

    const fetchAuxData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { token: token } };

            const [resTurmas, resModulos, resFormadores, resSalas] = await Promise.all([
                axios.get('http://localhost:5000/classes', config),
                axios.get('http://localhost:5000/modules', config),
                axios.get('http://localhost:5000/schedules/trainers-list', config),
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

    // CRUD AULAS
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { token: token } };

            if (editEvent) {
                // UPDATE
                await axios.put(`http://localhost:5000/schedules/${editEvent.id}`, formData, config);
                toast.success("Aula atualizada com sucesso!");
            } else {
                // CREATE
                await axios.post('http://localhost:5000/schedules', formData, config);
                toast.success("Aula agendada com sucesso!");
            }

            onSuccess(); // Recarrega calendário pai
            handleClose();

        } catch (error) {
            console.error(error);
            const msg = error.response?.data || "Erro ao guardar aula";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem a certeza que deseja eliminar esta aula?")) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { token: token } };

            // DELETE
            await axios.delete(`http://localhost:5000/schedules/${editEvent.id}`, config);
            toast.success("Aula eliminada.");
            onSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao eliminar aula.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{editEvent ? 'Editar Aula' : 'Agendar Nova Aula'}</Modal.Title>
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
                                <Form.Select name="modulo_id" value={formData.modulo_id} onChange={handleChange}>
                                    <option value="">Selecione (Opcional)...</option>
                                    {modulos.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.codigo})</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Formador</Form.Label>
                                <Form.Select name="formador_id" value={formData.formador_id} onChange={handleChange}>
                                    <option value="">Selecione (Opcional)...</option>
                                    {formadores.map(f => (
                                        <option key={f.id} value={f.id}>{f.nome}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Sala</Form.Label>
                                <Form.Select name="sala_id" value={formData.sala_id} onChange={handleChange}>
                                    <option value="">Selecione (Opcional)...</option>
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
                    {editEvent && (
                        <Button variant="danger" onClick={handleDelete} className="me-auto">
                            Eliminar
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'A guardar...' : (editEvent ? 'Atualizar' : 'Agendar')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateLessonModal;
