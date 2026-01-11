import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token2fa, setToken2fa] = useState(''); // Novo campo para o código
  const [pedir2fa, setPedir2fa] = useState(false); // Controla se mostramos o campo extra

  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    const bodyData = { email, password };
    // Se o servidor já pediu 2FA, enviamos também o código
    if (token2fa) bodyData.token2fa = token2fa;

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      // CASO ESPECIAL: Password certa, mas falta 2FA
      if (response.status === 400 && data.require2fa) {
        setPedir2fa(true);
        setErro("Código 2FA necessário. Verifica a tua App.");
        return;
      }

      if (response.ok) {
        // Guardar o token para o utilizador ficar "logado"
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Opcional: guardar dados do user
        navigate('/dashboard');
      } else {
        setErro(data.message || 'Email ou password incorretos.');
      }
    } catch (error) {
      setErro('O servidor não está a responder.');
    }
  };

  return (
    <div className="container" style={{ padding: '50px' }}>
      <h2>Entrar</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br/>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <label>Password:</label><br/>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {/* SÓ MOSTRA ISTO SE O SERVIDOR PEDIR */}
        {pedir2fa && (
          <div style={{ marginTop: '15px', background: '#f0f0f0', padding: '10px' }}>
            <label style={{ color: 'blue', fontWeight: 'bold' }}>Código Google Authenticator (2FA):</label><br/>
            <input 
              type="text" 
              value={token2fa} 
              onChange={(e) => setToken2fa(e.target.value)} 
              placeholder="000 000"
            />
          </div>
        )}

        <button type="submit" style={{ marginTop: '20px' }}>Entrar</button>
      </form>
      {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
    </div>
  );
}

export default Login;