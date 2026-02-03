import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Badge, Spinner, Modal} from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus, FaSave, FaFolder } from 'react-icons/fa';
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

    const [filesModalUser, setFilesModalUser] = useState(null);
    const [userFiles, setUserFiles] = useState([]);

    // Para impedir que o admin se apague a si próprio
    const { user: currentUser } = useAuth();

    //GET - Listar Utilizadores
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

    //PUT - Promover a Admin
    const handlePromote = async (id, nome) => {
        if (!window.confirm(`Tornar "${nome}" Administrador?`)) return;

        try {
            await api.put(`/admin/promover/${id}`);
            toast.success(`${nome} agora é Administrador!`);
            loadUsers(); // Recarrega para atualizar os ícones
        } catch (error) {
            toast.error('Erro ao promover utilizador.');
        }
    };

    //POST - Criar/Editar Utilizador
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                // EDITAR
                await api.put(`/admin/editar/${editandoId}`, {
                    nome: formData.nome,
                    email: formData.email,
                    is_admin: formData.is_admin,
                    role: formData.role // ADICIONADO: Envia o role
                });
                toast.success('Utilizador atualizado com sucesso!');
            } else {
                // CRIAR
                await api.post('/admin/criar', formData);
                toast.success('Utilizador criado com sucesso!');
            }

            // Limpar form e recarregar
            setFormData({ nome: '', email: '', password: '', role: 'user', is_admin: false });
            setEditandoId(null);
            loadUsers();

        } catch (error) {
            toast.error(error.response?.data || 'Erro ao guardar dados.');
        }
    };

    //PUT - Editar Utilizador
    const handleEditClick = (user) => {
        setEditandoId(user.id);
        setFormData({
            nome: user.nome,
            email: user.email,
            password: '', // Não preenchemos a password por segurança
            is_admin: user.is_admin,
            role: user.role // ADICIONADO: Define o role atual
        });
        // Scroll para o topo para ver o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditandoId(null);
        setFormData({ nome: '', email: '', password: '', role: 'user', is_admin: false });
    };

    // Filtragem - Pesquisa
    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //Modal Ficheiros
    const handleOpenFiles = async (user) => {
        setFilesModalUser(user);
        try{
            //rota criada em files.js
            const response = await api.get(`/files/admin/list/${user.id}`);
            setUserFiles(response.data);
        }catch(error){
            toast.error("Erro ao carregar ficheiros.");
            setUserFiles([]);
        }
    };

    //Dar upload - Admin
    const handleAdminUpload = async () => {
        const fileInput = document.getElementById('adminFileInput');
        const fileType = document.getElementById('adminFileType').value;

        if (!filesModalUser || !fileInput.files[0]) 
            return toast.error("Escolhe um ficheiro!");

        const formData = new FormData();

        formData.append('file', fileInput.files[0]);
        formData.append('tipo_ficheiro', fileType);

        try{
            const response = await api.post(`/files/admin/upload/${filesModalUser.id}`, formData);
            toast.success("Ficheiro enviado com sucesso!");
            handleOpenFiles(filesModalUser); //update Lista
            fileInput.value = null; //limpa input

        }catch(error){
            toast.error("Erro ao enviar ficheiro.");
        }
    };

    //Fazer download
    const handlleDownload = async (filename) => {
        try{
            const response = await api.get(`/files/download/${filename}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }catch(error){
            toast.error("Erro ao fazer download.");
        }
    }


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
                        <Card.Header className="border-0 pt-4 pb-0">
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
                                        className="border-0 py-2 shadow-sm"
                                        style={{ backgroundColor: 'var(--bg-page)' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="border-0 py-2 shadow-sm"
                                        style={{ backgroundColor: 'var(--bg-page)' }}
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
                                            className="border-0 py-2 shadow-sm"
                                            style={{ backgroundColor: 'var(--bg-page)' }}
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
                                        className="border-0 py-2 shadow-sm"
                                        style={{ backgroundColor: 'var(--bg-page)' }}
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
                                    <thead className="text-secondary">
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
                                                    <Button variant="link" className="text-info p-0 opacity-50 hover-opacity-100" onClick={() => handleOpenFiles(user)}>
                                                        <FaFolder />
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

            {/* MODAL DE FICHEIROS */}
            <Modal show={filesModalUser !== null} onHide={() => setFilesModalUser(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Ficha de: {filesModalUser?.nome}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <h6 className="mb-0">Documentos Existentes:</h6>
                         <Button variant="outline-danger" size="sm" onClick={async () => {
                             try {
                                const response = await api.get(`/files/export-pdf/${filesModalUser.id}`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Ficha_${filesModalUser.nome}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                toast.success('Ficha PDF exportada!');
                             } catch(e) { 
                                 console.error("Erro export PDF:", e);
                                 let errorMsg = "Erro ao gerar PDF.";
                                 if (e.response && e.response.data instanceof Blob) {
                                     try {
                                        const blobText = await e.response.data.text();
                                        errorMsg = blobText || errorMsg;
                                     } catch (err) { /* ignore */ }
                                 } else if (e.response && e.response.data) {
                                     errorMsg = e.response.data;
                                 }
                                 toast.error(errorMsg);
                             }
                         }}>
                            <FaSave className="me-2" />
                            Exportar Ficha (PDF)
                         </Button>
                    </div>
                    {/* 1. Lista de Ficheiros Existentes */}
                    {userFiles.length === 0 ? <p className="text-muted">Sem ficheiros.</p> : (
                        <ul>
                            {userFiles.map(f => (
                                <li key={f.id}>{f.tipo_ficheiro} - <a href={`#`} onClick={() => handlleDownload(f.nome_ficheiro)}>Transferir</a></li>
                            ))}
                        </ul>
                    )}
                    <hr/>
                    {/* 2. Upload de Novo Ficheiro */}
                    <h6>Adicionar Novo Documento:</h6>
                    <div className="d-flex gap-2">
                         <Form.Select id="adminFileType">
                            <option>Curriculum Vitae</option>
                            <option>Registo Criminal</option>
                            <option>Bolsa de Estudo</option>
                            <option>Certificado de Habilitações</option>
                            <option>Avaliação</option>
                            <option>Comprovativo IBAN</option>
                            <option>Outro</option>
                        </Form.Select>
                        <Form.Control type="file" id="adminFileInput" />
                        <Button onClick={() => handleAdminUpload()}>Anexar Documento</Button>
                    </div>
                </Modal.Body>
            </Modal>

            </Row>
        </Navbar>
    );
}

export default AdminUsers;