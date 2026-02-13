import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaBook, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import axios from 'axios';

import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Custom content for Treemap to show labels
const CustomizedContent = (props) => {
  const { depth, x, y, width, height, index, payload, colors, name } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[index % colors.length] : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name.split(' ')[0]} {/* Show only first name to avoid clutter */}
        </text>
      ) : null}
      {depth === 1 ? (
        <text
          x={x + 4}
          y={y + 18}
          fill="#fff"
          fontSize={12}
          fillOpacity={0.9}
        >
          {payload?.aulas}
        </text>
      ) : null}
    </g>
  );
};

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK DATA - To be replaced by proper API calls later
  const [schedule] = useState([
    { dia: 'Segunda', hora: '09:00 - 13:00', disciplina: 'Matemática', sala: 'B201' },
    { dia: 'Terça', hora: '14:00 - 17:00', disciplina: 'Programação Java', sala: 'Lab 3' },
  ]);

  const [absences] = useState({
    total: 12,
    justified: 10,
    unjustified: 2,
    limit: 30, // Example limit
    subjectBreakdown: [
      { subject: 'Matemática', count: 4, limit: 10 },
      { subject: 'Programação Java', count: 2, limit: 15 },
      { subject: 'Inglês Técnico', count: 6, limit: 10 },
    ]
  });

  useEffect(() => {
    if (user && user.is_admin) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/dashboard/stats', {
        headers: { token: token }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Erro estatisticas", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Navbar>
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold dashboard-welcome-text">Olá, {user.nome?.split(' ')[0]}</h2>
          <p className="text-secondary mb-0">
            {user.is_admin ? 'Visão geral do sistema' : 'Horário e assiduidade.'}
          </p>
        </div>
        <div className="d-none d-md-block text-end">
          <span className="badge bg-light text-secondary border px-3 py-2 fw-normal">
            <FaCalendarAlt className="me-2" />
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : user.is_admin && stats ? (
        /* DASHBOARD ADMIN */
        <Row className="g-4">
          {/* Totais Cards */}
          <Col md={3}>
            <Card className="card-modern border-0 p-3 h-100 text-center">
              <Card.Body>
                <FaBook className="text-secondary mb-2 display-6" opacity={0.5} />
                <h3 className="fw-bold">{stats.totais.cursosConcluidos}</h3>
                <span className="text-muted small">Cursos Terminados</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-modern border-0 p-3 h-100 text-center">
              <Card.Body>
                <FaBook className="text-primary mb-2 display-6" />
                <h3 className="fw-bold">{stats.totais.cursosDecorrer}</h3>
                <span className="text-muted small">Cursos a Decorrer</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-modern border-0 p-3 h-100 text-center">
              <Card.Body>
                <FaUserGraduate className="text-success mb-2 display-6" />
                <h3 className="fw-bold">{stats.totais.formandosAtivos}</h3>
                <span className="text-muted small">Formandos Ativos</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-modern border-0 p-3 h-100 text-center">
              <Card.Body>
                <FaChalkboardTeacher className="text-warning mb-2 display-6" />
                <h3 className="fw-bold">{stats.totais.formadores}</h3>
                <span className="text-muted small">Total Formadores</span>
              </Card.Body>
            </Card>
          </Col>

          {/* Charts */}
          <Col lg={8}>
            <Card className="card-modern border-0 h-100">
              <Card.Header className="border-0 pt-4 fw-bold">Top 10 Formadores (Aulas Agendadas)</Card.Header>
              <Card.Body style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    width={400}
                    height={200}
                    data={stats.topFormadores}
                    dataKey="aulas"
                    nameKey="nome"
                    ratio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                    content={<CustomizedContent colors={COLORS} />}
                  >
                    <Tooltip />
                  </Treemap>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="card-modern border-0 h-100">
              <Card.Header className="border-0 pt-4 fw-bold">Distribuição por Área</Card.Header>
              <Card.Body style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.cursosPorArea}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                      nameKey="nome"
                    >
                      {stats.cursosPorArea.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        /* DASHBOARD FORMANDO/FORMADOR (Mantém o original) */
        <Row className="g-4">
          {/* ... (código original para tabela de horário e faltas) ... */}
          <Col lg={12}>
            <Card className="card-modern border-0 h-100">
              <Card.Header className="border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaClock className="text-secondary me-2" />
                  <h6 className="fw-bold mb-0 text-uppercase ls-1 small">Horário Semanal</h6>
                </div>
              </Card.Header>
              <Card.Body>
                <Table hover responsive className="align-middle mb-0">
                  <thead className="text-secondary">
                    <tr>
                      <th className="border-0 small fw-bold ps-3">DIA</th>
                      <th className="border-0 small fw-bold">HORÁRIO</th>
                      <th className="border-0 small fw-bold">DISCIPLINA</th>
                      <th className="border-0 small fw-bold text-end pe-3">SALA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((aula, idx) => (
                      <tr key={idx}>
                        <td className="ps-3 fw-bold text-dark-blue">{aula.dia}</td>
                        <td className="text-muted small">{aula.hora}</td>
                        <td>
                          <div className="fw-bold">{aula.disciplina}</div>
                        </td>
                        <td className="text-end pe-3 text-muted">{aula.sala}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={12}>
            <Card className="card-modern border-0 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <Card.Body className="p-4 text-center">
                <h6 className="text-white-50 text-uppercase small ls-1 mb-3">Total de Faltas</h6>
                <div className="display-4 fw-bold mb-2">{absences.total}</div>
                <p className="small text-white-50 mb-0">
                  <span className="text-warning fw-bold">{absences.unjustified}</span> Injustificadas • <span className="text-success fw-bold">{absences.justified}</span> Justificadas
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Navbar>
  );
}

export default Dashboard;