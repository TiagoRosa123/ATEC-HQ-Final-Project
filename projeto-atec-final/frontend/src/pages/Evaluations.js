import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Table, Button, Form, Card, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

function Evaluations() {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [classModules, setClassModules] = useState([]); // Módulos da turma
    const [classStudents, setClassStudents] = useState([]); // Alunos da turma
    const [selectedModuleId, setSelectedModuleId] = useState("");
    const [formData, setFormData] = useState({ // Para dados da avaliação
        data_avaliacao: '',
        tipo_avaliacao: '',
        observacao: ''
    });

    //Obj. guarda notas temporariamente
    const [grades, setGrades] = useState({});
    //Carregar Turmas ao iniciar
    useEffect(() => {
        api.get('/classes').then(res => setClasses(res.data));
    }, []);

    //Quando seleciona a turma, carrega Módulos e Alunos
    const handleClassChange = async (turmaId) => {
        setSelectedClassId(turmaId);

        if (!turmaId) return;
        // Buscar Alunos
        const resStudents = await api.get(`/classes/${turmaId}/students`);
        setClassStudents(resStudents.data);
        // Buscar Curso para saber os Módulos
        const turma = classes.find(c => c.id == turmaId);

        if (turma) {
            // 1. Buscar módulos associados a este curso via tabela intermédia (idealmente)
            // Como não temos essa rota direta, vamos buscar todos e filtrar FEIO mas funcional por agora
            // TODO: Criar rota /courses/:id/modules para ser mais limpo
            const resModules = await api.get(`/modules`);
            // NOTA: Isto assume que a rota /modules retorna o curso_id ou que vamos buscar a relação
            // SE NÃO TIVERMOS RELAÇÃO NO GET /modules, mostramos todos (é o bug que te avisei).
            setClassModules(resModules.data);
        }
    };
    //Submeter Notas
    const handleSubmit = async () => {
        if (!selectedModuleId || !selectedClassId) return toast.error("Escolhe Turma e Módulo!");
        try {
            // Enviar uma nota por cada aluno que tenha nota preenchida
            const promises = Object.keys(grades).map(async (studentId) => {
                const nota = grades[studentId];
                if (nota) {
                    await api.post('/evaluations/create', {
                        turma_id: selectedClassId,
                        modulo_id: selectedModuleId,
                        formando_id: studentId,
                        nota: nota,
                        tipo_avaliacao: formData.tipo_avaliacao,
                        data_avaliacao: formData.data_avaliacao,
                        observacoes: formData.observacoes
                    });
                }
            });
            await Promise.all(promises);
            toast.success("Notas lançadas com sucesso!");
            setGrades({}); // Limpar
        } catch (error) {
            toast.error("Erro ao lançar notas.");
        }
    };
    return (
        <Navbar>
            <h2 className="mb-4">Lançamento de Notas</h2>
            <Card className="p-3 mb-4">
                <div className="d-flex gap-3">
                    <Form.Select value={selectedClassId} onChange={e => handleClassChange(e.target.value)}>
                        <option value="">1. Escolher Turma...</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.codigo}</option>)}
                    </Form.Select>
                    <Form.Select value={selectedModuleId} onChange={e => setSelectedModuleId(e.target.value)}>
                        <option value="">2. Escolher Módulo...</option>
                        {classModules.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </Form.Select>
                </div>

                <div className="d-flex gap-3 mt-3">
                    <Form.Select value={formData.tipo_avaliacao} onChange={e => setFormData({ ...formData, tipo_avaliacao: e.target.value })}>
                        <option value="Teste">Teste</option>
                        <option value="Projeto Final">Projeto Final</option>
                        <option value="Apresentação Oral">Apresentação Oral</option>
                        <option value="Recuperacao">Recuperação</option>
                        <option value="Estagio">Estágio</option>

                    </Form.Select>
                    <Form.Control type="date" value={formData.data_avaliacao} onChange={e => setFormData({ ...formData, data_avaliacao: e.target.value })} />
                </div>
            </Card>
            {selectedClassId && (
                <Table striped bordered>
                    <thead>
                        <tr><th>Aluno</th><th>Nota (0-20)</th></tr>
                    </thead>
                    <tbody>
                        {classStudents.map(student => (
                            <tr key={student.formando_id}>
                                <td>{student.nome}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        style={{ width: '100px' }}
                                        min="0" max="20"
                                        value={grades[student.formando_id] || ''}
                                        onChange={e => setGrades({ ...grades, [student.formando_id]: e.target.value })}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <Button size="lg" onClick={handleSubmit}>Lançar Notas</Button>
        </Navbar>
    );
}
export default Evaluations;