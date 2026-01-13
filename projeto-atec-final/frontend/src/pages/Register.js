import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // <--- 1. Importar Google
import { jwtDecode } from "jwt-decode";            // <--- 1. Importar descodificador

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: ''
  });
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // --- LÓGICA DO REGISTO NORMAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        alert("✅ Registo efetuado! Verifica o teu email para ativar a conta.");
        navigate('/login');
      } else {
        setErro(data);
      }
    } catch (err) {
      console.error(err);
      setErro('Erro ao conectar ao servidor');
    }
  };

  // --- LÓGICA DO REGISTO GOOGLE (Igual ao Login) ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Chamamos a mesma rota /google, pois ela cria o user se não existir
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
        // Guardamos o token e entramos direto (Google já valida o email)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setErro('Erro ao registar com Google.');
      }
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão com Google.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto', fontFamily: 'Arial' }}>
      <h2>Criar Conta</h2>
      {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
      
      {/* FORMULÁRIO NORMAL */}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" name="nome" placeholder="Nome" 
          onChange={handleChange} required 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <input 
          type="email" name="email" placeholder="Email" 
          onChange={handleChange} required 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <input 
          type="password" name="password" placeholder="Password" 
          onChange={handleChange} required 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Registar com Email
        </button>
      </form>

      <div style={{ margin: '20px 0', textAlign: 'center', color: '#666' }}>ou</div>

      {/* BOTÃO GOOGLE */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setErro('Registo com Google Falhou')}
          text="signup_with" // Muda o texto do botão para "Inscrever-se com Google"
          width="300"
        />
      </div>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Já tens conta? <Link to="/login">Entra aqui</Link>
      </p>
    </div>
  );
}

export default Register;