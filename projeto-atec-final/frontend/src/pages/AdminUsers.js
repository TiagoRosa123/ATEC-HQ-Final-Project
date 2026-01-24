import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '', email: '', password: '', role: 'user', is_admin: false });
    const [searchTerm, setSearchTerm] = useState("");
    const [editandoId, setEditandoId] = useState(null);

    // Para impedir que o admin se apague a si próprio
    const { user: currentUser } = useAuth();

    //Read
    const loadUsers = async () => {
        setLoading(true);
        try {
            // O token vai automaticamente graças ao api.js
            const response = await api.get('/admin/todos');
            setUsers(response.data);
        } catch (error) {
            toast.error('Erro ao carregar utilizadores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    //Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Tem a certeza que pretende apagar este utilizador?")) return;
        try {
            await api.delete(`/admin/apagar/${id}`);
            toast.success('Utilizador eliminado!');
            // Atualiza a lista localmente para não ter de ir ao servidor outra vez
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao apagar.');
        }
    };

    // --- UPDATE: Promover a Admin ---
    const handlePromote = async (id, nome) => {
        // Nota: Como o backend atual só tem "promover", não temos "despromover" ainda.
        // Vamos usar a rota /promover/:id que criámos no backend
        if (!window.confirm(`Tornar "${nome}" Administrador?`)) return;

        try {
            await api.put(`/admin/promover/${id}`);
            toast.success(`${nome} agora é Administrador!`);
            loadUsers(); // Recarrega para atualizar os ícones
        } catch (error) {
            toast.error('Erro ao promover utilizador.');
        }
    };

    //CREATE / UPDATE
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                // EDITAR
                await api.put(`/admin/editar/${editandoId}`, {
                    nome: formData.nome,
                    email: formData.email,
                    is_admin: formData.is_admin
                });
                toast.success('Utilizador atualizado com sucesso!');
            } else {
                // CRIAR
                await api.post('/admin/criar', formData);
                toast.success('Utilizador criado com sucesso!');
            }

            // Limpar form e recarregar
            setFormData({ nome: '', email: '', password: '', is_admin: false });
            setEditandoId(null);
            loadUsers();

        } catch (error) {
            toast.error(error.response?.data || 'Erro ao guardar dados.');
        }
    };

    const handleEditClick = (user) => {
        setEditandoId(user.id);
        setFormData({
            nome: user.nome,
            email: user.email,
            password: '', // Não preenchemos a password por segurança
            is_admin: user.is_admin
        });
        // Scroll para o topo para ver o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditandoId(null);
        setFormData({ nome: '', email: '', password: '', is_admin: false });
    };

    // Filtragem - Pesquisa
    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Navbar>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark-blue mb-1">Utilizadores</h2>
                    <p className="text-secondary small mb-0">Gestão de acessos e permissões.</p>
                </div>
            </div>

            {erro && <Alert variant="danger" onClose={() => setErro("")} dismissible className="shadow-sm border-0">{erro}</Alert>}

            <Row>
                <Col lg={12} className="mb-4">
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
                                        placeholder="Email"
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
                                    <Form.Label className="small text-secondary fw-bold">Cargo / Perfil</Form.Label>
                                    <Form.Select
                                        value={formData.role}
                                        onChange={e => {
                                            const newRole = e.target.value;
                                            setFormData({
                                                ...formData,
                                                role: newRole,
                                                is_admin: (newRole === 'admin') // Define is_admin automaticamente
                                            });
                                        }}
                                        className="bg-light border-0 py-2"
                                    >
                                        <option value="user">Utilizador</option>
                                        <option value="formando">Formando</option>
                                        <option value="formador">Formador</option>
                                        <option value="admin">Administrador</option>
                                    </Form.Select>
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

                <Col lg={12}>
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
                                                    {user.is_admin ? (
                                                        <Badge bg="primary" className="px-3 py-2 fw-normal">ADMIN</Badge>
                                                    ) : (
                                                        user.role === 'formando' ? <Badge bg="success" className="px-3 py-2 fw-normal">FORMANDO</Badge> :
                                                            user.role === 'formador' ? <Badge bg="warning" text="dark" className="px-3 py-2 fw-normal">FORMADOR</Badge> :
                                                                <Badge bg="light" text="dark" className="px-3 py-2 fw-normal border">USER</Badge>
                                                    )}
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