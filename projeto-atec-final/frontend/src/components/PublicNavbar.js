import React, { useState } from 'react';
import { Navbar, Container, Nav, Button, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaPaperPlane } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import axios from 'axios';
import toast from 'react-hot-toast';


const PublicNavbar = () => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        curso: '',
        mensagem: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/contact/application', formData);
            toast.success('Candidatura enviada com sucesso!');
            setShowModal(false);
            setFormData({ nome: '', email: '', telefone: '', curso: '', mensagem: '' });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar candidatura.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Navbar className="shadow-sm py-3 mb-4 bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold">
                    <div className="fs-3 fw-bold tracking-wide">
                        <span className="text-secondary brand-atec">ATEC</span><span style={{ color: 'var(--primary-blue)' }}>HQ</span>
                    </div>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="public-navbar-nav" />

                <Navbar.Collapse id="public-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <ThemeToggle />
                        <Button
                            variant="outline-secondary"
                            className="ms-3 px-4 rounded-pill d-flex align-items-center"
                            onClick={() => setShowModal(true)}
                        >
                            Candidatar-me
                        </Button>
                        <Button
                            as={Link}
                            to="/login"
                            variant="outline-secondary"
                            className="ms-2 px-4 rounded-pill d-flex align-items-center">
                            <FaSignInAlt className="me-2" />
                            Login / Criar Conta
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>

            {/* Modal de Candidatura */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Candidatura</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small mb-3">
                        Preencha os seus dados. Enviaremos a sua candidatura para análise.
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome Completo</Form.Label>
                            <Form.Control
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                placeholder="O teu nome"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="exemplo@email.com"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Telefone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                placeholder="Contacto telefónico"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Curso de Interesse</Form.Label>
                            <Form.Select
                                name="curso"
                                value={formData.curso}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleciona uma área/curso...</option>
                                <option value="TPSI - Programação">TPSI - Programação</option>
                                <option value="TPSI - Redes e Cibersegurança">TPSI - Redes e Cibersegurança</option>
                                <option value="TPSI - Mecatrónica">TPSI - Mecatrónica</option>
                                <option value="Outro">Outro</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mensagem</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="mensagem"
                                value={formData.mensagem}
                                onChange={handleChange}
                                placeholder="Dúvidas ou motivação..."
                            />
                        </Form.Group>
                        <div className="d-grid">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'A enviar...' : 'Enviar Candidatura'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Navbar>
    );
};

export default PublicNavbar;
