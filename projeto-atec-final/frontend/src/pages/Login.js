import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaFingerprint } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token2fa, setToken2fa] = useState('');
  const [pedir2fa, setPedir2fa] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const bodyData = { email, password };
    if (pedir2fa && token2fa) {
      bodyData.token2fa = token2fa;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.status === 400 && data.require2fa) {
        setPedir2fa(true);
        setLoading(false);
        return;
      }

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setErro(data.message || 'Email ou password incorretos.');
      }
    } catch (error) {
      setErro('O servidor não está a responder.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await fetch('http://localhost:5000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decoded.email, nome: decoded.name })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setErro('Erro ao entrar com Google.');
      }
    } catch (error) {
      setErro('Erro de conexão.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div className="text-center mb-4">
          <div className="fs-3 fw-bold text-dark-blue tracking-wide">
            ATEC<span className="text-accent">HQ</span>
          </div>
          <p className="text-secondary small mt-2">Plataforma de Gestão de Formação</p>
        </div>

        <Card className="card-modern border-0 shadow-lg">
          <Card.Body className="p-4">
            <h5 className="fw-bold text-dark-blue mb-4 text-center">
              {pedir2fa ? 'Verificação de Segurança' : 'Iniciar Sessão'}
            </h5>

            {erro && <Alert variant="danger" className="py-2 text-center small mb-4">{erro}</Alert>}

            {!pedir2fa ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <div className="position-relative">
                    <Form.Control
                      type="email"
                      placeholder="Email Corporativo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-light border-0 py-2 ps-5"
                    />
                    <FaEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <div className="position-relative">
                    <Form.Control
                      type="password"
                      placeholder="Palavra-passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-light border-0 py-2 ps-5"
                    />
                    <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  </div>
                  <div className="text-end mt-2">
                    <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--text-menu)' }}>
                      Recuperar palavra-passe?
                    </Link>
                  </div>
                </Form.Group>

                <Button type="submit" className="btn-primary-custom w-100 py-2 mb-3" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Entrar na Plataforma"}
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  <div className="bg-light rounded-circle p-3 d-inline-flex mb-3">
                    <FaFingerprint size={24} className="text-primary" />
                  </div>
                  <p className="small text-muted mb-0">
                    Insere o código de 6 dígitos da tua aplicação de autenticação.
                  </p>
                </div>

                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    placeholder="000 000"
                    value={token2fa}
                    onChange={(e) => setToken2fa(e.target.value)}
                    autoFocus
                    className="bg-light border-0 py-3 text-center fs-4 fw-bold letter-spacing-2"
                  />
                </Form.Group>

                <Button type="submit" className="btn-primary-custom w-100 py-2" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Verificar Identidade"}
                </Button>
              </Form>
            )}

            {!pedir2fa && (
              <>
                <div className="position-relative my-4">
                  <hr className="text-secondary opacity-25" />
                  <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    ou continuar com
                  </span>
                </div>

                <div className="d-flex justify-content-center mb-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErro('Login com Google Falhou')}
                    theme="filled_blue"
                    shape="circle"
                  />
                </div>

                <div className="text-center border-top pt-3">
                  <span className="small text-secondary">Ainda não tens conta? </span>
                  <Link to="/register" className="small fw-bold text-decoration-none" style={{ color: 'var(--primary-blue)' }}>
                    Criar Registo
                  </Link>
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <span className="text-muted small opacity-50">© 2026 ATEC Academia de Formação</span>
        </div>
      </div>
    </div>
  );
}

export default Login;