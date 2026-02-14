import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TablePagination, { paginate } from '../components/TablePagination';

function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [areas, setAreas] = useState([]); // Para o dropdown
    const [loading, setLoading] = useState(false);
    // Novo campo: estado
    const [formData, setFormData] = useState({ area_id: '', nome: '', capacidade: '', recursos: '', estado: 'disponivel' });
    const [editId, setEditId] = useState(null);

    const { user } = useAuth();
    const canEdit = user && user.is_admin;
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    //GET - Salas e Areas
    const loadData = async () => {
        setLoading(true);
        try {
            const [resRooms, resAreas] = await Promise.all([
                api.get('/rooms'),
                api.get('/areas')
            ]);
            setRooms(resRooms.data);
            setAreas(resAreas.data); // Precisamos das areas para o dropdown
        } catch (error) {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    //POST / PUT - Salas
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validação: capacidade deve ser número positivo
        if (formData.capacidade && (isNaN(formData.capacidade) || Number(formData.capacidade) <= 0)) {
            return toast.error('Capacidade deve ser um número positivo.');
        }
        try {
            if (editId) {
                await api.put(`/rooms/update/${editId}`, formData);
                toast.success('Sala atualizada!');
            } else {
                await api.post('/rooms/create', formData);
                toast.success('Sala criada!');
            }
            setFormData({ area_id: '', nome: '', capacidade: '', recursos: '', estado: 'disponivel' });
            setEditId(null);
            loadData();
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao guardar.');
        }
    };

    //DELETE - Salas
    const handleDelete = async (id) => {
        if (!window.confirm("Apagar esta sala?")) return;
        try {
            await api.delete(`/rooms/delete/${id}`);
            toast.success('Sala apagada.');
            loadData();
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao apagar.');
        }
    };

    // Helper para mostrar nome da área na tabela
    const getAreaName = (id) => {
        const area = areas.find(a => a.id === id);
        return area ? area.nome : 'Sem Área';
    };

    return (
        <Navbar>
            <h2 className="mb-4">Gestão de Salas</h2>

            {/* FORMULÁRIO */}
            {canEdit && (
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="d-flex gap-2 flex-wrap align-items-end">
                        <Form.Control
                            placeholder="Nome da Sala"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                        <Form.Control
                            placeholder="Capacidade"
                            type="number"
                            value={formData.capacidade}
                            onChange={e => setFormData({ ...formData, capacidade: e.target.value })}
                            required
                            style={{ maxWidth: '100px' }}
                        />
                        <Form.Select
                            value={formData.area_id}
                            onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                            required
                            style={{ maxWidth: '180px' }}
                        >
                            <option value="">Área...</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>{area.nome}</option>
                            ))}
                        </Form.Select>

                        {/* ESTADO SALA */}
                        <Form.Select
                            value={formData.estado || 'disponivel'} // Fallback
                            onChange={e => setFormData({ ...formData, estado: e.target.value })}
                            style={{ maxWidth: '150px' }}
                        >
                            <option value="disponivel">Disponível</option>
                            <option value="indisponivel">Indisponível</option>
                        </Form.Select>

                        <Form.Control
                            placeholder="Recursos..."
                            value={formData.recursos}
                            onChange={e => setFormData({ ...formData, recursos: e.target.value })}
                        />
                        <Button type="submit" className="btn-primary-custom px-4">
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
                            placeholder="🔍 Pesquisar salas..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    {(() => {
                        const filtered = rooms.filter(r =>
                            r.nome.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        const { paginatedItems, totalPages } = paginate(filtered, currentPage);
                        return (<>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Nome</th>
                                <th>Área</th>
                                <th>Capacidade</th>
                                <th>Recursos</th>
                                {canEdit && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map(room => (
                                <tr key={room.id}>
                                    <td>
                                        <span className={`badge ${room.estado === 'disponivel' ? 'bg-success' : 'bg-danger'}`}>
                                            {room.estado === 'disponivel' ? 'Livre' : 'Ocupada'}
                                        </span>
                                    </td>
                                    <td><strong>{room.nome}</strong></td>
                                    <td>{getAreaName(room.area_id)}</td>
                                    <td>{room.capacidade}</td>
                                    <td>{room.recursos}</td>
                                    {canEdit && (
                                    <td>
                                        <Button variant="link" onClick={() => {
                                            setEditId(room.id);
                                            setFormData({
                                                area_id: room.area_id,
                                                nome: room.nome,
                                                capacidade: room.capacidade,
                                                recursos: room.recursos,
                                                estado: room.estado
                                            });
                                        }}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="link" className="text-danger" onClick={() => handleDelete(room.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                    )}
                                </tr>
                            ))}
                            {rooms.length === 0 && !loading &&
                                <tr><td colSpan="6" className="text-center text-muted">Ainda não há salas criadas.</td></tr>
                            }
                        </tbody>
                    </Table>
                    <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>);
                    })()}
                </Card.Body>
            </Card>
        </Navbar>
    );
}

export default AdminRooms;
