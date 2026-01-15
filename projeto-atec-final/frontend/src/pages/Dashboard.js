import React, { useState } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Dashboard() {
  const { user } = useAuth();

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

  return (
    <Navbar>
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold text-dark-blue">Olá, {user.nome?.split(' ')[0]}</h2>
          <p className="text-secondary mb-0">Horário e assiduidade.</p>
        </div>
        <div className="d-none d-md-block text-end">
          <span className="badge bg-light text-secondary border px-3 py-2 fw-normal">
            <FaCalendarAlt className="me-2" />
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <Row className="g-4">
        {/* --- LEFT COLUMN: TABLE (Horário) --- */}
        <Col lg={12}>
          <Card className="card-modern border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaClock className="text-secondary me-2" />
                <h6 className="fw-bold mb-0 text-uppercase ls-1 small">Horário Semanal</h6>
              </div>
            </Card.Header>
            <Card.Body>
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light text-secondary">
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

        {/* --- RIGHT COLUMN: ABSENCES (Faltas) --- */}
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
    </Navbar>
  );
}

export default Dashboard;