import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPw() {
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  
  // O 'token' vem do URL (ex: /reset-password/abcd123...)
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem("Sucesso! A password foi alterada.");
        setTimeout(() => navigate('/login'), 3000); // Vai para o login após 3s
      } else {
        setErro(data.message || "Token inválido ou expirado.");
      }
    } catch (error) {
      setErro("Erro de conexão.");
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Definir Nova Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="password" 
          placeholder="Nova Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          style={{ padding: '10px', width: '250px' }}
        />
        <br /><br />
        <button type="submit">Alterar Password</button>
      </form>

      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default ResetPw;