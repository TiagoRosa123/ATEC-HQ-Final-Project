import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

function ForgotPw() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/esqueci-Pw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email enviado! Verifique a sua caixa de correio.");
      } else {
        toast.error(data.message || "Erro ao enviar email.");
      }
    } catch (error) {
      toast.error("Erro de conexão ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div className="text-center mb-4">
          <div className="fs-3 fw-bold text-dark-blue tracking-wide">
            <span className="text-secondary">ATEC</span><span style={{ color: 'var(--primary-blue)' }}>HQ</span>
          </div>
          <p className="text-secondary small mt-2">Recuperação de Acesso</p>
        </div>

        <Card className="card-modern border-0 shadow-lg">
          <Card.Body className="p-4">
            <h5 className="fw-bold text-dark-blue mb-4 text-center">
              Recuperar Password
            </h5>
            <p className="text-muted small text-center mb-4">
              Insira o seu email para receber um link de redefinição.
            </p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <div className="position-relative">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-light border-0 py-2 ps-5"
                  />
                  <FaEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
              </Form.Group>

              <Button type="submit" className="btn-primary-custom w-100 py-2" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Enviar Link"}
              </Button>
            </Form>

            <div className="text-center border-top pt-3 mt-4">
              <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: 'var(--primary-blue)' }}>
                Voltar ao Login
              </Link>
            </div>

          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <span className="text-muted small opacity-50">© 2026 ATEC.HQ Academia de Formação</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPw;