import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '', sigla: '', descricao: '', area_id: '' });
    const [editandoId, setEditandoId] = useState(null);
    const [areas, setAreas] = useState([]);

    const loadAreas = async () => {
        try {
            const res = await api.get('/areas');
            setAreas(res.data);
        } catch (error) {
            toast.error('Erro ao carregar áreas');
        }
    }

    useEffect(() => { loadAreas(); }, []);


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
                                        <Button variant="link" onClick={() => {
                                            setEditandoId(course.id);
                                            setFormData({ nome: course.nome, sigla: course.sigla, descricao: course.descricao });
                                        }}>
                                            <FaEdit />
                                        </Button>
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
        </Navbar>
    );
}

export default AdminCourses;
