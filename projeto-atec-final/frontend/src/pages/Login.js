import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaFingerprint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token2fa, setToken2fa] = useState(''); // Cod. do Google Authenticator
  const [pedir2fa, setPedir2fa] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bodyData = { email, password };

    if (pedir2fa && token2fa) {
      bodyData.token2fa = token2fa;
    }

    try {
      // --- ALTERAÇÃO AQUI: Usar api.post ---
      const response = await api.post('/auth/login', bodyData);
      
      // Se chegou aqui, é sucesso (Axios lança erro se for 4xx/5xx)
      const data = response.data;

      login(data.token, data.user); // Guarda a sessão no contexto
      toast.success(`Bem-vindo, ${data.user.nome.split(' ')[0]}!`);
      navigate('/dashboard');

    } catch (error) {
      // O Axios guarda a resposta do erro em error.response
      const status = error.response?.status;
      const data = error.response?.data;

      // 1. Verifica se o backend pede 2FA (Erro 400 + flag require2fa)
      if (status === 400 && data?.require2fa) {
        setPedir2fa(true);
        toast('Autenticação de 2 fatores necessária.', { icon: '🔐' });
      } 
      // 2. Outros erros (senha errada, user não encontrado, etc)
      else {
        const msg = typeof data === 'string' ? data : data?.msg || 'Email ou password incorretos.';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  //quando o login com Google corre bem
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // Envia o backend processar/criar conta
     const response = await api.post('/auth/google', { 
        email: decoded.email, 
        nome: decoded.name,
        googleId: decoded.sub 
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        toast.success(`Login Google com sucesso!`);
        navigate('/dashboard');
      } else {
        toast.error('Erro ao entrar com Google.');
      }
    } catch (error) {
      toast.error('Erro de conexão ao Google.');
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

            {!pedir2fa ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
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
                      Recuperar palavra-passe ?
                    </Link>
                  </div>
                </Form.Group>

                <Button type="submit" className="btn-primary-custom w-100 py-2 mb-3" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Entrar"}
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  <div className="bg-light rounded-circle p-3 d-inline-flex mb-3">
                    <FaFingerprint size={24} className="text-primary" />
                  </div>
                  <p className="small text-muted mb-0">
                    Por favor insira o código de 6 dígitos do Google Authenticator.
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
                    ou
                  </span>
                </div>

                <div className="d-flex justify-content-center mb-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Login com Google Falhou')}
                    theme="filled_blue"
                    shape="circle"
                  />
                </div>

                <div className="text-center border-top pt-3">
                  <span className="small text-secondary">Ainda não tem conta ? </span>
                  <Link to="/register" className="small fw-bold text-decoration-none" style={{ color: 'var(--primary-blue)' }}>
                    Criar conta
                  </Link>
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <span className="text-muted small opacity-50">© 2026 ATE.HQ Academia de Formação</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
