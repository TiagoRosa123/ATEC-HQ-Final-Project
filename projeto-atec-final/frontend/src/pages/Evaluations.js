import React from 'react';
import Navbar from '../components/Navbar';
import { Card, Table, Badge, Row, Col } from 'react-bootstrap';
import { FaClipboardList, FaChartLine } from 'react-icons/fa';

function Evaluations() {
    // Mock Data
    const evaluations = [
        { disciplina: 'Matemática', modulo: 'M1 - Álgebra', nota: 16, data: '2025-10-15' },
        { disciplina: 'Programação Java', modulo: 'J1 - Introdução', nota: 18, data: '2025-11-20' },
        { disciplina: 'Programação Java', modulo: 'J2 - OOP', nota: 17, data: '2026-01-10' },
        { disciplina: 'Inglês Técnico', modulo: 'ENG-1', nota: 14, data: '2025-12-05' },
        { disciplina: 'Base de Dados', modulo: 'SQL Fundamentals', nota: 19, data: '2025-11-30' },
    ];

    const average = evaluations.reduce((acc, curr) => acc + curr.nota, 0) / evaluations.length;

    return (
        <Navbar>
            <div className="d-flex align-items-center mb-5">
                <div className="bg-white p-2 rounded shadow-sm me-3">
                    <FaClipboardList size={24} className="text-secondary" />
                </div>
                <div>
                    <h2 className="fw-bold text-dark-blue mb-0">Avaliações</h2>
                    <p className="text-secondary mb-0">Notas e progresso académico.</p>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={12}>
                    <Card className="card-modern border-0 text-white mb-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' }}>
                        <Card.Body className="p-4 text-center">
                            <div className="bg-white/10 rounded-circle d-inline-flex p-3 mb-3">
                                <FaChartLine size={24} className="text-white" />
                            </div>
                            <h6 className="text-white-50 text-uppercase small ls-1 mb-2">Média Atual</h6>
                            <div className="display-3 fw-bold mb-0">{average.toFixed(1)}</div>
                            <div className="small text-white-50">Valores</div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={12}>
                    <Card className="card-modern border-0">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <h6 className="fw-bold text-uppercase text-secondary ls-1 small mb-0">Histórico de Notas</h6>
                        </Card.Header>
                        <Card.Body>
                            <Table hover responsive className="align-middle mb-0">
                                <thead className="bg-light text-secondary">
                                    <tr>
                                        <th className="border-0 small fw-bold ps-3">MÓDULO</th>
                                        <th className="border-0 small fw-bold">DATA</th>
                                        <th className="border-0 small fw-bold text-end pe-4">NOTA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluations.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-3 py-3">
                                                <div className="fw-bold text-dark-blue">{item.disciplina}</div>
                                                <div className="small text-muted">{item.modulo}</div>
                                            </td>
                                            <td className="text-muted small">{item.data}</td>
                                            <td className="text-end pe-4">
                                                <Badge
                                                    bg={item.nota >= 10 ? (item.nota >= 16 ? 'success' : 'info') : 'danger'}
                                                    className="px-3 py-2 fs-6 fw-normal"
                                                >
                                                    {item.nota}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Navbar>
    );
}

export default Evaluations;
