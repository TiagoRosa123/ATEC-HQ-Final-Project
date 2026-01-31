import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Card, Row, Col, Badge, Form, Button } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaIdCard, FaUserTag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

function PersonalData() {
    const [user, setUser] = useState({ nome: '', email: '', id: '', role: '', is_admin: false });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        loadData();
        loadFiles();
    }, []);

    const loadData = async () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    };

    const loadFiles = async () => {
        try {
            const res = await api.get('/files/my-files');
            setFiles(res.data);
        } catch (e) { console.error("Erro files"); }
    }

    const handleDownload = async (filename, originalName) => {
        try {
            const response = await api.get(`/files/download/${filename}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName || filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            toast.error("Erro ao fazer download.");
        }
    };

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
                    <Card className="mt-4 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <h6 className="fw-bold text-uppercase text-secondary ls-1">Meus Documentos</h6>
                        </Card.Header>
                        <Card.Body>


                            <h6 className="fw-bold text-secondary mb-3">Documentos Enviados</h6>
                            {files.length === 0 ? <p className="text-muted small">Nenhum ficheiro enviado ainda.</p> : (
                                <ul className="list-group list-group-flush">
                                    {files.map(f => (
                                        <li key={f.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                                            <div>
                                                <div className="fw-bold text-dark-blue">{f.tipo_ficheiro}</div>
                                                <small className="text-muted">{f.nome_ficheiro.substring(f.nome_ficheiro.indexOf('-') + 1)}</small>
                                            </div>
                                            <Button variant="outline-primary" size="sm" onClick={() => handleDownload(f.nome_ficheiro, f.nome_ficheiro)}>
                                                Download ⬇️
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Navbar>
    );
}

export default PersonalData;
