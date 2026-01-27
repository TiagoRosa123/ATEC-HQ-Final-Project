import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

function AdminAreas() {
    const [areas, setAreas] = useState([]); //area
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '', descricao: '' });
    const [editId, setEditId] = useState(null);

    //GET - Listar Areas
    const loadAreas = async () => {
        setLoading(true);
        try {
            const res = await api.get('/areas');
            setAreas(res.data);
        } catch (error) {
            toast.error('Erro ao carregar as areas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAreas(); }, []);

    //POST - Criar/Editar Area
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/areas/update/${editId}`, formData);
                toast.success('Area atualizada!');
            } else {
                await api.post('/areas/create', formData);
                toast.success('Area criada!');
            }
            setFormData({ nome: '', descricao: '' });
            setEditId(null);
            loadAreas();
        } catch (error) {
            toast.error('Erro ao guardar.');
        }
    };

    //DELETE - Apagar Area
    const handleDelete = async (id) => {
        if (!window.confirm("Apagar esta area?")) return;
        try {
            await api.delete(`/areas/delete/${id}`);
            toast.success('Area apagada.');
            loadAreas();
        } catch (error) {
            toast.error('Erro ao apagar.');
        }
    };

    return (
        <Navbar>
            <h2 className="mb-4">Gestão de Areas</h2>

            {/* FORMULÁRIO */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="d-flex gap-2">
                        <Form.Control
                            placeholder="Nome da Area"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                        <Form.Control
                            placeholder="Descrição"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        />
                        <Button type="submit" variant="primary">
                            {editId ? <FaSave /> : <FaPlus />}
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
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areas.map(area => (
                                <tr key={area.id}>
                                    <td>{area.nome}</td>
                                    <td>{area.descricao}</td>
                                    <td>
                                        <Button variant="link" onClick={() => {
                                            setEditId(area.id);
                                            setFormData({ nome: area.nome, descricao: area.descricao });
                                        }}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="link" className="text-danger" onClick={() => handleDelete(area.id)}>
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

export default AdminAreas;
