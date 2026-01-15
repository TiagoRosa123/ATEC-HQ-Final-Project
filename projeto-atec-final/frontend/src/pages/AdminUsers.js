import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus, FaSave } from 'react-icons/fa';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ nome: '', email: '', password: '', is_admin: false });
    const [editandoId, setEditandoId] = useState(null);

    // 1. LOAD (READ)
    const loadUsers = async () => {
        setLoading(true);
        try {
            // User had modified this manually to be simpler, let's respect that fetch logic but keep it safe
            const response = await fetch("http://localhost:5000/admin/todos", {
                method: "GET",
                headers: { token: localStorage.getItem("token") }
            });
            const data = await response.json();

            if (response.ok) {
                setUsers(data);
            } else {
                setErro(data.error || "Erro ao carregar dados");
            }
        } catch (err) {
            setErro("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    // 2. DELETE
    const handleDelete = async (id) => {
        if (!window.confirm("Tens a certeza que queres apagar este utilizador?")) return;
        try {
            const response = await fetch(`http://localhost:5000/admin/apagar/${id}`, {
                method: "DELETE",
                headers: { token: localStorage.getItem("token") }
            });
            if (response.ok) {
                loadUsers();
            } else {
                alert("Erro ao apagar");
            }
        } catch (e) { console.error(e); }
    };

    // 3. PREPARE EDIT
    const handleEditClick = (user) => {
        setEditandoId(user.id);
        setFormData({
            nome: user.nome,
            email: user.email,
            password: '',
            is_admin: user.is_admin
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 4. CANCEL
    const handleCancel = () => {
        setEditandoId(null);
        setFormData({ nome: '', email: '', password: '', is_admin: false });
        setErro("");
    };

    // 5. SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editandoId
            ? `http://localhost:5000/admin/editar/${editandoId}`
            : "http://localhost:5000/admin/criar";

        const method = editandoId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token")
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                handleCancel();
                loadUsers();
            } else {
                const data = await response.json();
                setErro(data.error || "Erro ao salvar.");
            }
        } catch (error) {
            console.error(error);
            setErro("Erro de conexão.");
        }
    }

    return (
        <Navbar>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark-blue mb-1">Utilizadores</h2>
                    <p className="text-secondary small mb-0">Gestão de acessos e permissões.</p>
                </div>
                {/* Could add a global "Add User" button here if table detached from form */}
            </div>

            {erro && <Alert variant="danger" onClose={() => setErro("")} dismissible className="shadow-sm border-0">{erro}</Alert>}

            <Row>
                {/* --- FORM CARD --- */}
                <Col lg={4} className="mb-4">
                    <Card className="card-modern h-100 border-0">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <h6 className="fw-bold text-uppercase text-secondary ls-1">
                                {editandoId ? 'Editar Registo' : 'Novo Registo'}
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Nome Completo"
                                        value={formData.nome}
                                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                        required
                                        className="bg-light border-0 py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="email"
                                        placeholder="Email Corporativo"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="bg-light border-0 py-2"
                                    />
                                </Form.Group>

                                {!editandoId && (
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="password"
                                            placeholder="Definir Password"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            className="bg-light border-0 py-2"
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-4">
                                    <Form.Check
                                        type="switch"
                                        id="admin-switch"
                                        label="Atribuir permissões de Administrador"
                                        checked={formData.is_admin}
                                        onChange={e => setFormData({ ...formData, is_admin: e.target.checked })}
                                        className="small text-secondary"
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button type="submit" className="btn-primary-custom">
                                        {editandoId ? <><FaSave className="me-2" />Guardar Alterações</> : <><FaUserPlus className="me-2" />Criar Utilizador</>}
                                    </Button>

                                    {editandoId && (
                                        <Button variant="outline-secondary" onClick={handleCancel} className="text-muted border-0">
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* --- TABLE CARD --- */}
                <Col lg={8}>
                    <Card className="card-modern border-0">
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="p-5 text-center"><Spinner animation="border" variant="primary" /></div>
                            ) : (
                                <Table hover responsive className="mb-0 align-middle">
                                    <thead className="bg-light text-secondary">
                                        <tr>
                                            <th className="ps-4 py-3 border-0 small fw-bold">NOME / EMAIL</th>
                                            <th className="py-3 border-0 small fw-bold">REGRA</th>
                                            <th className="text-end pe-4 py-3 border-0 small fw-bold">AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td className="ps-4 py-3">
                                                    <div className="fw-bold text-dark-blue">{user.nome}</div>
                                                    <div className="text-muted small">{user.email}</div>
                                                </td>
                                                <td>
                                                    {user.is_admin
                                                        ? <Badge bg="primary" className="px-3 py-2 fw-normal">ADMIN</Badge>
                                                        : <Badge bg="light" text="dark" className="px-3 py-2 fw-normal border">USER</Badge>
                                                    }
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Button variant="link" className="text-muted p-0 me-3" onClick={() => handleEditClick(user)}>
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="link" className="text-danger p-0 opacity-50 hover-opacity-100" onClick={() => handleDelete(user.id)}>
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-5 text-muted">Ainda não existem utilizadores.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Navbar>
    );
}

export default AdminUsers;