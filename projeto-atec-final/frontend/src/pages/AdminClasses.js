import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Badge, Modal, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function AdminClasses() {
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]); // Para cursos 
    const [formData, setFormData] = useState({ // Para dados da turma
        codigo: '',
        curso_id: '',
        data_inicio: '',
        data_fim: '',
        estado: 'planeamento'
    });
    const [editId, setEditId] = useState(null); // Para editar uma turma
    const [showStudentsModal, setShowStudentsModal] = useState(false); // Para mostrar os alunos de uma turma
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentsList, setStudentsList] = useState([]); // Para listar os alunos
    const [newStudentId, setNewStudentId] = useState(""); // Para adicionar um aluno
    const [allFormandos, setAllFormandos] = useState([]); // Todos os formandos disponíveis

    const { user } = useAuth();
    const canEdit = user && user.is_admin;

    // LOGICA DE ALUNOS
    const handleOpenStudents = async (cls) => {
        setSelectedClass(cls);
        setShowStudentsModal(true);
        loadStudents(cls.id);
        // Carregar lista de formandos para o dropdown
        try {
            const res = await api.get('/classes/formandos');
            setAllFormandos(res.data);
        } catch (err) { console.error('Erro ao carregar formandos'); }
    };

    //GET - Listar alunos
    const loadStudents = async (turmaId) => {
        try {
            const res = await api.get(`/classes/${turmaId}/students`);
            setStudentsList(res.data);
        } catch (error) { toast.error("Erro ao carregar alunos."); }
    };

    // POST - Add aluno
    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/classes/${selectedClass.id}/students`, { formando_id: newStudentId });
            toast.success("Aluno inscrito!");
            setNewStudentId("");
            loadStudents(selectedClass.id);
        } catch (error) { toast.error("Erro ao inscrever (Aluno já existe?)"); }
    };

    // DELETE - Remover aluno
    const handleRemoveStudent = async (formandoId) => {
        if (!window.confirm("Remover aluno da turma?")) return;
        try {
            await api.delete(`/classes/${selectedClass.id}/students/${formandoId}`);
            toast.success("Aluno removido.");
            loadStudents(selectedClass.id);
        } catch (error) { toast.error("Erro ao remover."); }
    };

    // Carregar Turmas e Cursos (para poder escolher o curso)
    const loadData = async () => {
        try {
            const [resClasses, resCourses] = await Promise.all([
                api.get('/classes'),
                api.get('/courses')
            ]);
            setClasses(resClasses.data);
            setCourses(resCourses.data);
        } catch (error) { toast.error('Erro ao carregar dados'); }
    };
    useEffect(() => { loadData(); }, []);

    // POST - Add turma
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/classes/update/${editId}`, formData);
                toast.success('Turma atualizada!');
            } else {
                await api.post('/classes/create', formData);
                toast.success('Turma criada!');
            }
            setFormData({ codigo: '', curso_id: '', data_inicio: '', data_fim: '', estado: 'pendente' });
            setEditId(null);
            loadData();
        } catch (error) { toast.error('Erro ao guardar.'); }
    };

    // DELETE - Remover turma
    const handleDelete = async (id) => {
        if (!window.confirm("Apagar turma?")) return;
        try {
            await api.delete(`/classes/delete/${id}`);
            toast.success('Turma apagada.');
            loadData();
        } catch (error) { toast.error('Erro ao apagar.'); }
    };
    //Ajuda para formatar a data que vem da BD para o input type="date"
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };
    // Buscar nome do curso pelo ID
    const getCourseName = (id) => {
        const course = courses.find(c => c.id === id);
        return course ? course.nome : 'Curso Desconhecido';
    };
    return (
        <Navbar>
            <h2 className="mb-4">Gestão de Turmas</h2>
            {canEdit && (
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-2">
                            <Form.Control
                                placeholder="Código"
                                value={formData.codigo}
                                onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <Form.Select
                                value={formData.curso_id}
                                onChange={e => setFormData({ ...formData, curso_id: e.target.value })}
                                required
                            >
                                <option value="">Selecionar Curso...</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome} ({c.sigla})</option>
                                ))}
                            </Form.Select>
                        </div>
                        <div className="col-md-2">
                            <Form.Control type="date"
                                value={formatDateForInput(formData.data_inicio)}
                                onChange={e => setFormData({ ...formData, data_inicio: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <Form.Control type="date"
                                value={formatDateForInput(formData.data_fim)}
                                onChange={e => setFormData({ ...formData, data_fim: e.target.value })}
                            />
                        </div>
                        <div className="col-md-2">
                            <Form.Select
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                            >
                                <option value="pendente">Pendente</option>
                                <option value="ativa">Ativa</option>
                                <option value="concluida">Concluída</option>
                                <option value="cancelada">Cancelada</option>
                            </Form.Select>
                        </div>
                        <div className="col-md-1">
                            <Button type="submit" className="btn-primary-custom w-100">
                                {editId ? <FaSave /> : <FaPlus />}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
            )}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Curso</th>
                                <th>Data Início</th>
                                <th>Estado</th>
                                <th>Alunos</th>
                                {canEdit && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id}>
                                    <td><strong>{cls.codigo}</strong></td>
                                    <td>{getCourseName(cls.curso_id)}</td>
                                    <td>{new Date(cls.data_inicio).toLocaleDateString()}</td>
                                    <td>
                                        <Badge bg={
                                            cls.estado === 'ativa' ? 'success' :
                                                cls.estado === 'concluida' ? 'secondary' :
                                                    cls.estado === 'cancelada' ? 'danger' : 'warning'
                                        }>
                                            {cls.estado.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button variant="outline-info" size="sm" onClick={() => handleOpenStudents(cls)}>
                                            <FaUsers className="me-2" />Ver
                                        </Button>
                                    </td>
                                    {canEdit && (
                                    <td>
                                        <Button variant="link" onClick={() => {
                                            setEditId(cls.id);
                                            setFormData(cls);
                                        }}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="link" className="text-danger" onClick={() => handleDelete(cls.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* MODAL DE ALUNOS */}
            <Modal show={showStudentsModal} onHide={() => setShowStudentsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Alunos da Turma: {selectedClass?.codigo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {canEdit && (
                    <Form onSubmit={handleAddStudent} className="d-flex gap-2 mb-4 p-3 bg-light rounded">
                        <Form.Select
                            value={newStudentId}
                            onChange={e => setNewStudentId(e.target.value)}
                            required
                        >
                            <option value="">Selecionar Formando...</option>
                            {allFormandos
                                .filter(f => !studentsList.some(s => s.formando_id === f.id))
                                .map(f => (
                                    <option key={f.id} value={f.id}>{f.nome} ({f.email})</option>
                                ))}
                        </Form.Select>
                        <Button type="submit" variant="success"><FaPlus /> Inscrever</Button>
                    </Form>
                    )}

                    <h6 className="text-secondary fw-bold mb-3">Inscritos ({studentsList.length})</h6>
                    <ListGroup>
                        {studentsList.map(stud => (
                            <ListGroup.Item key={stud.formando_id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="fw-bold">{stud.nome}</div>
                                    <div className="small text-muted">{stud.email}</div>
                                </div>
                                {canEdit && (
                                <Button variant="outline-danger" size="sm" onClick={() => handleRemoveStudent(stud.formando_id)}>
                                    <FaTrash />
                                </Button>
                                )}
                            </ListGroup.Item>
                        ))}
                        {studentsList.length === 0 && <p className="text-muted text-center pt-3">Ainda sem alunos inscritos.</p>}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </Navbar>
    );
}
export default AdminClasses;