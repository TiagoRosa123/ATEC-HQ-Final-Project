import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

const AutoScheduleModal = ({ show, handleClose, onSuccess }) => {
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        turma_id: '',
        data_inicio: '',
        data_fim: '',
        regime: 'diurno'
    });

    useEffect(() => {
        if (show) {
            setResult(null);
            fetchTurmas();
        }
    }, [show]);

    const fetchTurmas = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/classes', {
                headers: { token }
            });
            setTurmas(res.data.filter(t => t.estado === 'ativa'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5000/schedules/generate',
                formData,
                { headers: { token } }
            );
            setResult(res.data);
            toast.success(res.data.mensagem);
            if (onSuccess) onSuccess();
        } catch (err) {
            const msg = err.response?.data || err.message;
            toast.error("Erro: " + msg);
            setResult({ sucesso: false, mensagem: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>Geração Automática de Horários</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleGenerate}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label><strong>Turma</strong></Form.Label>
                                <Form.Select name="turma_id" value={formData.turma_id} onChange={handleChange} required>
                                    <option value="">Selecione uma turma...</option>
                                    {turmas.map(t => (
                                        <option key={t.id} value={t.id}>{t.codigo}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label><strong>Regime</strong></Form.Label>
                                <Form.Select name="regime" value={formData.regime} onChange={handleChange} required>
                                    <option value="diurno">Diurno (08:00 - 15:00)</option>
                                    <option value="noturno">Noturno (16:00 - 23:00)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label><strong>Data Início</strong></Form.Label>
                                <Form.Control
                                    type="date"
                                    name="data_inicio"
                                    value={formData.data_inicio}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label><strong>Data Fim</strong></Form.Label>
                                <Form.Control
                                    type="date"
                                    name="data_fim"
                                    value={formData.data_fim}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="bg-light rounded p-3 mb-3">
                        <small className="text-muted">
                            {formData.regime === 'diurno' ? (
                                <>
                                    <strong>Horário Diurno:</strong> 08:00-11:00 + 12:00-15:00 (Almoço: 11:00-12:00)
                                    <br />Blocos de 3h + 3h = <strong>6h/dia</strong>
                                </>
                            ) : (
                                <>
                                    <strong>Horário Noturno:</strong> 16:00-19:00 + 20:00-23:00 (Jantar: 19:00-20:00)
                                    <br />Blocos de 3h + 3h = <strong>6h/dia</strong>
                                </>
                            )}
                        </small>
                    </div>

                    <div className="d-grid">
                        <Button variant="primary" type="submit" disabled={loading} size="lg">
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    A gerar horários...
                                </>
                            ) : (
                                'Gerar Horário Automático'
                            )}
                        </Button>
                    </div>
                </Form>

                {result && (
                    <div className="mt-4">
                        <Alert variant={result.sucesso ? 'success' : 'danger'}>
                            <Alert.Heading>
                                {result.sucesso ? '✅ Geração Concluída!' : '❌ Erro na Geração'}
                            </Alert.Heading>
                            <p>{result.mensagem}</p>

                            {result.criadas !== undefined && (
                                <p><strong>Aulas criadas:</strong> {result.criadas}</p>
                            )}

                            {result.naoAgendados && result.naoAgendados.length > 0 && (
                                <>
                                    <hr />
                                    <p className="mb-1"><strong>⚠️ Módulos não totalmente agendados:</strong></p>
                                    <ul className="mb-0">
                                        {result.naoAgendados.map((msg, i) => (
                                            <li key={i}>{msg}</li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {result.avisos && result.avisos.length > 0 && (
                                <>
                                    <hr />
                                    <details>
                                        <summary><strong>Detalhes ({result.avisos.length} avisos)</strong></summary>
                                        <ul className="mt-2 mb-0">
                                            {result.avisos.map((msg, i) => (
                                                <li key={i} className="text-muted small">{msg}</li>
                                            ))}
                                        </ul>
                                    </details>
                                </>
                            )}
                        </Alert>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AutoScheduleModal;
