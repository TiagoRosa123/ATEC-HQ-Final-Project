import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  //guarda os dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia os dados para o endpoint de registo
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registo efetuado! Verifique o seu email para ativar a conta.");
        navigate('/login');
      } else {
        toast.error(typeof data === 'string' ? data : data.message || 'Erro ao registar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao conectar ao servidor');
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
        body: JSON.stringify({
          email: decoded.email,
          nome: decoded.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        toast.success('Registo com Google efetuado!');
        navigate('/dashboard');
      } else {
        toast.error('Erro ao registar com Google.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro de conexão com Google.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div className="text-center mb-4">
          <div className="fs-3 fw-bold text-dark-blue tracking-wide">
            ATEC<span className="text-accent">HQ</span>
          </div>
          <p className="text-secondary small mt-2">Junta-se à nossa plataforma</p>
        </div>

        <Card className="card-modern border-0 shadow-lg">
          <Card.Body className="p-4">
            <h5 className="fw-bold text-dark-blue mb-4 text-center">
              Criar Conta
            </h5>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    name="nome"
                    placeholder="Nome Completo"
                    onChange={handleChange}
                    required
                    className="bg-light border-0 py-2 ps-5"
                  />
                  <FaUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="position-relative">
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
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
                    name="password"
                    placeholder="Palavra-passe"
                    onChange={handleChange}
                    required
                    className="bg-light border-0 py-2 ps-5"
                  />
                  <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
              </Form.Group>

              <Button type="submit" className="btn-primary-custom w-100 py-2 mb-3" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Registar"}
              </Button>
            </Form>

            <div className="position-relative my-4">
              <hr className="text-secondary opacity-25" />
              <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                ou continuar com
              </span>
            </div>

            <div className="d-flex justify-content-center mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Registo com Google Falhou')}
                theme="filled_blue"
                shape="circle"
              />
            </div>

            <div className="text-center border-top pt-3">
              <span className="small text-secondary">Já tens conta? </span>
              <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: 'var(--primary-blue)' }}>
                Entrar aqui
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

export default Register;
