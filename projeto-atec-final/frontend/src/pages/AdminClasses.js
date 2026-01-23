import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

function AdminClasses() {
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({ 
        codigo: '', 
        curso_id: '', 
        data_inicio: '', 
        data_fim: '', 
        estado: 'planeamento' 
    });
    const [editandoId, setEditandoId] = useState(null);
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await api.put(`/classes/update/${editandoId}`, formData);
                toast.success('Turma atualizada!');
            } else {
                await api.post('/classes/create', formData);
                toast.success('Turma criada!');
            }
            setFormData({ codigo: '', curso_id: '', data_inicio: '', data_fim: '', estado: 'planeamento' });
            setEditandoId(null);
            loadData();
        } catch (error) { toast.error('Erro ao guardar.'); }
    };
    const handleDelete = async (id) => {
        if (!window.confirm("Apagar turma?")) return;
        try {
            await api.delete(`/classes/delete/${id}`);
            toast.success('Turma apagada.');
            loadData();
        } catch (error) { toast.error('Erro ao apagar.'); }
    };
    // Helper para formatar a data que vem da BD para o input type="date"
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
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-2">
                            <Form.Control 
                                placeholder="Código (ex: TPSI.1024)" 
                                value={formData.codigo}
                                onChange={e => setFormData({...formData, codigo: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="col-md-3">
                            <Form.Select 
                                value={formData.curso_id}
                                onChange={e => setFormData({...formData, curso_id: e.target.value})}
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
                                onChange={e => setFormData({...formData, data_inicio: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="col-md-2">
                            <Form.Control type="date"
                                value={formatDateForInput(formData.data_fim)}
                                onChange={e => setFormData({...formData, data_fim: e.target.value})}
                            />
                        </div>
                        <div className="col-md-2">
                            <Form.Select 
                                value={formData.estado}
                                onChange={e => setFormData({...formData, estado: e.target.value})}
                            >
                                <option value="planeamento">Planeamento</option>
                                <option value="ativo">Ativo</option>
                                <option value="concluido">Concluído</option>
                            </Form.Select>
                        </div>
                        <div className="col-md-1">
                            <Button type="submit" variant="primary" className="w-100">
                                {editandoId ? <FaSave /> : <FaPlus />}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Curso</th>
                                <th>Data Início</th>
                                <th>Estado</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id}>
                                    <td><strong>{cls.codigo}</strong></td>
                                    <td>{getCourseName(cls.curso_id)}</td>
                                    <td>{new Date(cls.data_inicio).toLocaleDateString()}</td>
                                    <td>
                                        <Badge bg={cls.estado === 'ativo' ? 'success' : cls.estado === 'concluido' ? 'secondary' : 'warning'}>
                                            {cls.estado}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button variant="link" onClick={() => {
                                            setEditandoId(cls.id);
                                            setFormData(cls);
                                        }}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="link" className="text-danger" onClick={() => handleDelete(cls.id)}>
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
export default AdminClasses;