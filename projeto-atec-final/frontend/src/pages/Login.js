import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- 1. ADICIONEI O LINK AQUI
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados do 2FA
  const [token2fa, setToken2fa] = useState('');
  const [pedir2fa, setPedir2fa] = useState(false); // Se true, mostra o campo extra

  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    const bodyData = { email, password };
    
    // Se estamos na fase de pedir o código, adicionamo-lo ao envio
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

      // CASO ESPECIAL: Password certa, mas falta 2FA
      if (response.status === 400 && data.require2fa) {
        setPedir2fa(true); // <--- Ativa o campo visual do 2FA
        setErro("🔐 Código 2FA necessário. Verifica a tua App.");
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
    }
  };

  // --- FUNÇÃO GOOGLE ---
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setErro('Erro ao entrar com Google.');
      }
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto', fontFamily: 'Arial' }}>
      <h2>Login</h2>
      {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
      
      <form onSubmit={handleSubmit}>
        
        {/* CAMPO EMAIL */}
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} // <--- 2. CORRIGIDO (Direto para o estado)
          required 
          disabled={pedir2fa} // Bloqueia se estivermos a pedir o 2FA
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
        />

        {/* CAMPO PASSWORD */}
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} // <--- 2. CORRIGIDO
          required 
          disabled={pedir2fa}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
        />

        {/* 3. CAMPO 2FA (Só aparece se pedir2fa for true) */}
        {pedir2fa && (
            <div style={{ background: '#e8f0fe', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.9em', color: '#1a73e8' }}>Insere o código da App (6 dígitos):</label>
                <input 
                    type="text" 
                    placeholder="000 000" 
                    value={token2fa}
                    onChange={(e) => setToken2fa(e.target.value)}
                    autoFocus
                    style={{ display: 'block', width: '100%', marginTop: '5px', padding: '10px', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
                />
            </div>
        )}

        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          {pedir2fa ? "Verificar Código" : "Entrar"}
        </button>
      </form>

      {/* BOTÃO DA GOOGLE */}
      {!pedir2fa && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErro('Login com Google Falhou')}
            />
          </div>
      )}

      <p style={{ marginTop: '20px' }}>
        Ainda não tens conta? <Link to="/register">Regista-te aqui</Link>
      </p>
      <p>
        <Link to="/forgot-password">Esqueci-me da password</Link>
      </p>
    </div>
  );
}

export default Login;