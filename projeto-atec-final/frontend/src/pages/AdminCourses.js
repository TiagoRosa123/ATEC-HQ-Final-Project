import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave, FaBook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '', sigla: '', descricao: '', area_id: '' });
    const [editandoId, setEditandoId] = useState(null);

    const [areas, setAreas] = useState([]);

    const [showModulesModal, setShowModulesModal] = useState(false);
    const [courseModules, setCoursesModules] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState(null); // Para saber qual curso está aberto

    const loadAreas = async () => {
        try {
            const res = await api.get('/areas');
            setAreas(res.data);
        } catch (error) {
            toast.error('Erro ao carregar áreas');
        }
    }
    useEffect(() => { loadAreas(); }, []);

    const loadAllModules = async () => {
        try {
            const res = await api.get('/modules');
            setAllModules(res.data);
        } catch (error) { toast.error('Erro ao carregar lista de módulos'); }
    };
    useEffect(() => { loadAllModules(); }, []);

    // 1. CARREGAR CURSOS (GET)
    const loadCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (error) {
            toast.error('Erro ao carregar cursos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCourses(); }, []);

    // 2. CRIAR OU EDITAR (POST / PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await api.put(`/courses/update/${editandoId}`, formData);
                toast.success('Curso atualizado!');
            } else {
                await api.post('/courses/create', formData);
                toast.success('Curso criado!');
            }
            setFormData({ nome: '', sigla: '', descricao: '', area_id: '' });
            setEditandoId(null);
            loadCourses();
        } catch (error) {
            toast.error('Erro ao guardar.');
        }
    };

    // 3. APAGAR (DELETE)
    const handleDelete = async (id) => {
        if (!window.confirm("Apagar este curso?")) return;
        try {
            await api.delete(`/courses/delete/${id}`);
            toast.success('Curso apagado.');
            loadCourses();
        } catch (error) {
            toast.error('Erro ao apagar.');
        }
    };

    const handleOpenModules = async (id) => {
        try {
            setSelectedCourseId(id); //Guardamos o ID do curso
            const res = await api.get(`/courses/${id}/modules`);
            setCoursesModules(res.data);
            setShowModulesModal(true);
        } catch (error) {
            toast.error('Erro ao carregar módulos');
        }
    };

    const handleAddModule = async () => {
        if (!selectedModuleId) return;
        try {
            await api.post(`/courses/${selectedCourseId}/modules`, { modulo_id: selectedModuleId });
            toast.success('Módulo adicionado!');
            handleOpenModules(selectedCourseId); // Recarrega a lista
            setSelectedModuleId('');
        } catch (error) { toast.error('Erro ao adicionar (pode já estar associado).'); }
    };
    const handleRemoveModule = async (modulo_id) => {
        if (!window.confirm("Remover este módulo do curso?")) return;
        try {
            await api.delete(`/courses/${selectedCourseId}/modules/${modulo_id}`);
            toast.success('Módulo removido.');
            handleOpenModules(selectedCourseId);
        } catch (error) { toast.error('Erro ao remover.'); }
    };

    return (
        <Navbar>
            <h2 className="mb-4">Gestão de Cursos</h2>

            {/* FORMULÁRIO */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="d-flex gap-2">
                        <Form.Control
                            placeholder="Nome do Curso"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                        <Form.Control
                            placeholder="Sigla (ex: TPSI)"
                            value={formData.sigla}
                            onChange={e => setFormData({ ...formData, sigla: e.target.value })}
                            required
                            style={{ maxWidth: '150px' }}
                        />
                        <Form.Select
                            value={formData.area_id}
                            onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                            required
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="">Área...</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>{area.nome}</option>
                            ))}
                        </Form.Select>
                        <Form.Control
                            placeholder="Descrição"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        />
                        <Button type="submit" variant="primary">
                            {editandoId ? <FaSave /> : <FaPlus />}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* TABELA */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Sigla</th>
                                <th>Nome</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td><strong>{course.sigla}</strong></td>
                                    <td>{course.nome}</td>
                                    <td>
                                        {/* Btn Editar */}
                                        <Button variant="link" onClick={() => {
                                            setEditandoId(course.id);
                                            setFormData({ nome: course.nome, sigla: course.sigla, descricao: course.descricao });
                                        }}>
                                            <FaEdit />
                                        </Button>

                                        {/* Btn Modulos */}
                                        <Button variant="link" className="text-info" onClick={() => handleOpenModules(course.id)}>
                                            <FaBook />
                                        </Button>

                                        {/* Btn Apagar */}
                                        <Button variant="link" className="text-danger" onClick={() => handleDelete(course.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* MODAL DE MÓDULOS */}
            <Modal show={showModulesModal} onHide={() => setShowModulesModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Módulos do Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                     <div className="d-flex gap-2 mb-4">
                        <Form.Select 
                            value={selectedModuleId} 
                            onChange={e => setSelectedModuleId(e.target.value)}
                        >
                            <option value="">Escolher módulo para adicionar...</option>
                            {allModules.map(mod => (
                                <option key={mod.id} value={mod.id}>
                                    {mod.nome} ({mod.codigo})
                                </option>
                            ))}
                        </Form.Select>
                        <Button variant="success" onClick={handleAddModule} disabled={!selectedModuleId}>
                            <FaPlus />
                        </Button>
                    </div>
                    {/* PARTE DE BAIXO: Lista */}
                    {courseModules.length === 0 ? (
                        <p className="text-muted text-center py-3">Este curso ainda não tem módulos.</p>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>Horas</th>
                                    <th style={{width: '50px'}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseModules.map(mod => (
                                    <tr key={mod.id}>
                                        <td>{mod.codigo}</td>
                                        <td>{mod.nome}</td>
                                        <td>{mod.horas_totais} h</td>
                                        <td>
                                            <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveModule(mod.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModulesModal(false)}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Navbar>
    );
}

export default AdminCourses;
