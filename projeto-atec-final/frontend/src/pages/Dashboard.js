import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaBook, FaUserGraduate, FaChalkboardTeacher, FaUsers } from 'react-icons/fa';
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import api from '../services/api';

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
          {name.split(' ')[0]}
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
  const [formadorStats, setFormadorStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user.is_admin || user.role === 'secretaria') {
          const res = await api.get('/dashboard/stats');
          setStats(res.data);
        } else if (user.role === 'formador') {
          try {
            const res = await api.get('/dashboard/stats/formador');
            setFormadorStats(res.data);
          } catch (err) {
            console.error("Erro ao carregar stats formador", err);
            // Mostrar layout formador mesmo sem dados
            setFormadorStats({ proximasAulas: [], turmasAtivas: 0, aulasEstaSemana: 0, totalAlunos: 0 });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Subtítulo por role
  const getSubtitle = () => {
    if (user.is_admin) return 'Visão geral do sistema';
    if (user.role === 'secretaria') return 'Visão geral do sistema';
    if (user.role === 'formador') return 'As suas turmas e aulas';
    return 'Bem-vindo à plataforma ATEC HQ';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <Navbar>
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold dashboard-welcome-text">Olá, {user.nome?.split(' ')[0]}</h2>
          <p className="text-secondary mb-0">{getSubtitle()}</p>
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
      ) : (user.is_admin || user.role === 'secretaria') && stats ? (
        /* DASHBOARD ADMIN / SECRETÁRIA */
        <Row className="g-4">
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
      ) : user.role === 'formador' && formadorStats ? (
        /* DASHBOARD FORMADOR */
        <Row className="g-4">
          <Col md={4}>
            <Card className="card-modern border-0 p-3 h-100 text-center">
              <Card.Body>
                <FaUsers className="text-primary mb-2 display-6" />
                <h3 className="fw-bold">{formadorStats.turmasAtivas}</h3>
                <span className="text-muted small">Turmas Ativas</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="card-modern border-0 p-3 h-100 text-center">
              <Card.Body>
                <FaClock className="text-success mb-2 display-6" />
                <h3 className="fw-bold">{formadorStats.aulasEstaSemana}</h3>
                <span className="text-muted small">Aulas esta Semana</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="card-modern border-0 p-3 h-100 text-center">
              <Card.Body>
                <FaUserGraduate className="text-warning mb-2 display-6" />
                <h3 className="fw-bold">{formadorStats.totalAlunos}</h3>
                <span className="text-muted small">Alunos nas suas Turmas</span>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={12}>
            <Card className="card-modern border-0 h-100">
              <Card.Header className="border-0 pt-4 pb-0 d-flex align-items-center">
                <FaClock className="text-secondary me-2" />
                <h6 className="fw-bold mb-0 text-uppercase ls-1 small">Próximas Aulas</h6>
              </Card.Header>
              <Card.Body>
                {formadorStats.proximasAulas.length > 0 ? (
                <Table hover responsive className="align-middle mb-0">
                  <thead className="text-secondary">
                    <tr>
                      <th className="border-0 small fw-bold ps-3">DATA</th>
                      <th className="border-0 small fw-bold">HORÁRIO</th>
                      <th className="border-0 small fw-bold">MÓDULO</th>
                      <th className="border-0 small fw-bold">TURMA</th>
                      <th className="border-0 small fw-bold text-end pe-3">SALA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formadorStats.proximasAulas.map((aula, idx) => (
                      <tr key={idx}>
                        <td className="ps-3 fw-bold">{formatDate(aula.data)}</td>
                        <td className="text-muted small">{aula.hora_inicio?.slice(0, 5)} - {aula.hora_fim?.slice(0, 5)}</td>
                        <td><div className="fw-bold">{aula.modulo}</div></td>
                        <td><Badge bg="info">{aula.turma}</Badge></td>
                        <td className="text-end pe-3 text-muted">{aula.sala || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                ) : (
                  <p className="text-muted text-center py-4">Sem aulas agendadas.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        /* DASHBOARD FORMANDO / GENÉRICO */
        <Row className="g-4">
          <Col lg={12}>
            <Card className="card-modern border-0 text-center p-5">
              <Card.Body>
                <FaUserGraduate className="text-primary display-4 mb-3" />
                <h4 className="fw-bold">Bem-vindo à plataforma <span className="text-secondary brand-atec">ATEC</span><span style={{ color: 'var(--primary-blue)' }}>HQ</span></h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Navbar>
  );
}

export default Dashboard;