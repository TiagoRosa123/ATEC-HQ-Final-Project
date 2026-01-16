import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

function ResetPw() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Sucesso! A password foi alterada.");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.message || "Token inválido ou expirado.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div className="text-center mb-4">
          <div className="fs-3 fw-bold text-dark-blue tracking-wide">
            ATEC<span className="text-accent">HQ</span>
          </div>
        </div>

        <Card className="card-modern border-0 shadow-lg">
          <Card.Body className="p-4">
            <h5 className="fw-bold text-dark-blue mb-4 text-center">
              Definir Nova Password
            </h5>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <div className="position-relative">
                  <Form.Control
                    type="password"
                    placeholder="Nova Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-light border-0 py-2 ps-5"
                  />
                  <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
              </Form.Group>

              <Button type="submit" className="btn-primary-custom w-100 py-2" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Alterar Password"}
              </Button>
            </Form>

          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <span className="text-muted small opacity-50">© 2026 ATEC.HQ Academia de Formação</span>
        </div>
      </div>
    </div>
  );
}

export default ResetPw;