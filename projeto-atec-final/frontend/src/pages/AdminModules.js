import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function AdminModules() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '', horas_totais: '', codigo: '' });
    const [editandoId, setEditandoId] = useState(null);
    const [modulos, setModule] = useState([]);

    const { user } = useAuth();
    const canEdit = user && user.is_admin;

    //GET - Listar Modulos
    const loadModule = async () => {
        try {
            const res = await api.get('/modules');
            setModule(res.data);
        } catch (error) {
            toast.error('Erro ao carregar módulos');
        }
    }
    useEffect(() => { loadModule(); }, []);


    //GET Modulos
    const loadModules = async () => {
        setLoading(true);
        try {
            const res = await api.get('/modules');
            setModules(res.data);
        } catch (error) {
            toast.error('Erro ao carregar modulos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadModules(); }, []);

    //POST / PUT modules
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await api.put(`/modules/update/${editandoId}`, formData);
                toast.success('Modulo atualizado!');
            } else {
                await api.post('/modules/create', formData);
                toast.success('Modulo criado!');
            }
            setFormData({ nome: '', horas_totais: '', codigo: '' });
            setEditandoId(null);
            loadModules();
        } catch (error) {
            toast.error('Erro ao guardar.');
        }
    };

    //DELETE modulo
    const handleDelete = async (id) => {
        if (!window.confirm("Apagar este modulo?")) return;
        try {
            await api.delete(`/modules/delete/${id}`);
            toast.success('Modulo apagado.');
            loadModules();
        } catch (error) {
            toast.error('Erro ao apagar.');
        }
    };

    return (
        <Navbar>
            <h2 className="mb-4">Gestão de Módulos</h2>

            {canEdit && (
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="d-flex gap-2">
                        <Form.Control
                            placeholder="Nome do Módulo"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                        <Form.Control
                            placeholder="Horas totais"
                            value={formData.horas_totais}
                            onChange={e => setFormData({ ...formData, horas_totais: e.target.value })}
                            required
                            style={{ maxWidth: '150px' }}
                        />
                        <Form.Control
                            placeholder="Código"
                            value={formData.codigo}
                            onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                        />
                        <Button type="submit" className="btn-primary-custom px-4">
                            {editandoId ? <FaSave /> : <FaPlus />}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            )}

            {/* TABELA */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Horas totais</th>
                                <th>Código</th>
                                {canEdit && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {modules.map(module => (
                                <tr key={module.id}>
                                    <td><strong>{module.nome}</strong></td>
                                    <td>{module.horas_totais}</td>
                                    <td>{module.codigo}</td>
                                    {canEdit && (
                                    <td>
                                        <Button variant="link" onClick={() => {
                                            setEditandoId(module.id);
                                            setFormData({ nome: module.nome, horas_totais: module.horas_totais, codigo: module.codigo });
                                        }}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="link" className="text-danger" onClick={() => handleDelete(module.id)}>
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
        </Navbar>
    );
}

export default AdminModules;
