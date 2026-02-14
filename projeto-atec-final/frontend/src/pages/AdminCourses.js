import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave, FaBook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TablePagination, { paginate } from '../components/TablePagination';

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '', sigla: '', descricao: '', area_id: '', imagem: '', duracao_horas: '' }); //guarda o que o user esta a escrever
    const [editId, setEditId] = useState(null); //guarda o ID do curso que esta a ser editado

    const [areas, setAreas] = useState([]); //guarda as areas

    const [showModulesModal, setShowModulesModal] = useState(false);
    const [courseModules, setCoursesModules] = useState([]); //guarda os módulos do curso
    const [allModules, setAllModules] = useState([]); //guarda todos os módulos
    const [selectedModuleId, setSelectedModuleId] = useState(''); //guarda o ID do módulo selecionado
    const [selectedCourseId, setSelectedCourseId] = useState(null); // Para saber qual curso está aberto

    const { user } = useAuth();
    const canEdit = user && user.is_admin;
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    //GET - Areas
    const loadAreas = async () => {
        try {
            const res = await api.get('/areas');
            setAreas(res.data);
        } catch (error) {
            toast.error('Erro ao carregar áreas');
        }
    }
    useEffect(() => { loadAreas(); }, []);

    //GET - Módulos
    const loadAllModules = async () => {
        try {
            const res = await api.get('/modules');
            setAllModules(res.data);
        } catch (error) { toast.error('Erro ao carregar lista de módulos'); }
    };
    useEffect(() => { loadAllModules(); }, []);

    //GET - Cursos
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

    //POST / PUT - Cursos
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validação: duração deve ser número positivo
        if (formData.duracao_horas && (isNaN(formData.duracao_horas) || Number(formData.duracao_horas) <= 0)) {
            return toast.error('Duração deve ser um número positivo de horas.');
        }
        try {
            if (editId) {
                await api.put(`/courses/update/${editId}`, formData);
                toast.success('Curso atualizado!');
            } else {
                await api.post('/courses/create', formData);
                toast.success('Curso criado!');
            }
            setFormData({ nome: '', sigla: '', descricao: '', area_id: '', imagem: '', duracao_horas: '' });
            setEditId(null);
            loadCourses();
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao guardar.');
        }
    };

    //DELETE - Cursos
    const handleDelete = async (id) => {
        if (!window.confirm("Apagar este curso?")) return;
        try {
            await api.delete(`/courses/delete/${id}`);
            toast.success('Curso apagado.');
            loadCourses();
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao apagar.');
        }
    };

    //GET - Módulos do curso
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

    //POST - Módulos do curso
    const handleAddModule = async () => {
        if (!selectedModuleId) return;
        try {
            await api.post(`/courses/${selectedCourseId}/modules`, { modulo_id: selectedModuleId });
            toast.success('Módulo adicionado!');
            handleOpenModules(selectedCourseId); // Recarrega a lista
            setSelectedModuleId('');
        } catch (error) { toast.error('Erro ao adicionar (pode já estar associado).'); }
    };

    //DELETE - Módulos do curso
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
            {canEdit && (
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="d-flex gap-2 align-items-end">
                        <div className="d-flex flex-column gap-2 flex-grow-1">
                            {/* Linha 1 */}
                            <div className="d-flex gap-2">
                                <Form.Control
                                    placeholder="Nome do Curso"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                />
                                <Form.Control
                                    placeholder="Sigla"
                                    value={formData.sigla}
                                    onChange={e => setFormData({ ...formData, sigla: e.target.value })}
                                    required
                                    style={{ maxWidth: '100px' }}
                                />
                                <Form.Control
                                    type="number"
                                    placeholder="Horas"
                                    value={formData.duracao_horas}
                                    onChange={e => setFormData({ ...formData, duracao_horas: e.target.value })}
                                    style={{ maxWidth: '100px' }}
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
                            </div>
                            {/* Linha 2 */}
                            <div className="d-flex gap-2">
                                <Form.Control
                                    placeholder="URL da Imagem (https://...)"
                                    value={formData.imagem}
                                    onChange={e => setFormData({ ...formData, imagem: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="Descrição Curta"
                                    value={formData.descricao}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="btn-primary-custom px-4" style={{ height: 'fit-content', alignSelf: 'center' }}>
                            {editId ? <FaSave /> : <FaPlus />}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            )}

            {/* TABELA */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="mb-3">
                        <Form.Control
                            placeholder="🔍 Pesquisar cursos..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    {(() => {
                        const filtered = courses.filter(c =>
                            c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.sigla && c.sigla.toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                        const { paginatedItems, totalPages } = paginate(filtered, currentPage);
                        return (<>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Sigla</th>
                                <th>Nome</th>
                                {canEdit ? <th>Ações</th> : <th>Módulos</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map(course => (
                                <tr key={course.id}>
                                    <td><strong>{course.sigla}</strong></td>
                                    <td>{course.nome}</td>
                                    <td>
                                        {/* Btn Editar */}
                                        {canEdit && (
                                        <Button variant="link" onClick={() => {
                                            setEditId(course.id);
                                            setFormData({
                                                nome: course.nome,
                                                sigla: course.sigla,
                                                descricao: course.descricao,
                                                area_id: course.area_id,
                                                imagem: course.imagem || '',
                                                duracao_horas: course.duracao_horas || ''
                                            });
                                        }}>
                                            <FaEdit />
                                        </Button>
                                        )}

                                        {/* Btn Modulos */}
                                        <Button variant="link" className="text-info" onClick={() => handleOpenModules(course.id)}>
                                            <FaBook />
                                        </Button>

                                        {/* Btn Apagar */}
                                        {canEdit && (
                                        <Button variant="link" className="text-danger" onClick={() => handleDelete(course.id)}>
                                            <FaTrash />
                                        </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>);
                    })()}
                </Card.Body>
            </Card>

            {/* MODAL DE MÓDULOS */}
            <Modal show={showModulesModal} onHide={() => setShowModulesModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Módulos do Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {canEdit && (
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
                    )}
                    {/* Lista de módulos do curso */}
                    {courseModules.length === 0 ? (
                        <p className="text-muted text-center py-3">Este curso ainda não tem módulos.</p>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>Horas</th>
                                    {canEdit && <th style={{ width: '50px' }}></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {courseModules.map(mod => (
                                    <tr key={mod.id}>
                                        <td>{mod.codigo}</td>
                                        <td>{mod.nome}</td>
                                        <td>{mod.horas_totais} h</td>
                                        {canEdit && (
                                        <td>
                                            <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveModule(mod.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                        )}
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
