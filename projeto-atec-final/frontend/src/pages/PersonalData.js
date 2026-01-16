import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaIdCard, FaUserTag } from 'react-icons/fa';

function PersonalData() {
    const [user, setUser] = useState({ nome: '', email: '', id: '', role: '', is_admin: false });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <Navbar>
            <div className="d-flex align-items-center mb-5">
                <div className="bg-white p-2 rounded shadow-sm me-3">
                    <FaUser size={24} className="text-secondary" />
                </div>
                <div>
                    <h2 className="fw-bold text-dark-blue mb-0">Dados Pessoais</h2>
                    <p className="text-secondary mb-0">Informações de registo.</p>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="card-modern border-0">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <h6 className="fw-bold text-uppercase text-secondary ls-1 small mb-0">Perfil de Utilizador</h6>
                        </Card.Header>
                        <Card.Body className="p-4">

                            <div className="d-flex align-items-center mb-5">
                                <div className="bg-light rounded-circle p-4 me-4 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <span className="fs-2 fw-bold text-dark-blue">
                                        {user.nome ? user.nome.charAt(0).toUpperCase() : '?'}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="fw-bold text-dark-blue mb-1">{user.nome}</h4>
                                    <Badge bg={user.is_admin ? "primary" : "info"} className="fw-normal px-3 py-2">
                                        {user.is_admin ? "ADMINISTRADOR" : "UTILIZADOR"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="row g-4">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded h-100 border border-light">
                                        <div className="d-flex align-items-center mb-2 text-secondary">
                                            <FaEnvelope className="me-2" />
                                            <span className="small fw-bold">Email</span>
                                        </div>
                                        <div className="fw-bold text-dark-blue">{user.email}</div>
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div className="p-3 bg-light rounded h-100 border border-light">
                                        <div className="d-flex align-items-center mb-2 text-secondary">
                                            <FaIdCard className="me-2" />
                                            <span className="small fw-bold">ID Interno</span>
                                        </div>
                                        <div className="font-monospace text-dark-blue">{user.id}</div>
                                    </div>
                                </Col>

                                <Col md={12}>
                                    <div className="p-3 bg-light rounded h-100 border border-light">
                                        <div className="d-flex align-items-center mb-2 text-secondary">
                                            <FaUserTag className="me-2" />
                                            <span className="small fw-bold">Permissões</span>
                                        </div>
                                        <div className="text-dark-blue">
                                            {user.is_admin
                                                ? "Acesso total à gestão de utilizadores, cursos e configurações do sistema."
                                                : "Acesso à área de estudante, curso inscrito e materiais didáticos."
                                            }
                                        </div>
                                    </div>
                                </Col>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Navbar>
    );
}

export default PersonalData;
