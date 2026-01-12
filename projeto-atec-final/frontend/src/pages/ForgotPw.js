import React, { useState } from 'react';

function ForgotPw() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    try {
      const response = await fetch('http://localhost:5000/auth/esqueci-Pw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem("Email enviado! Por favor verifique a sua caixa de correio.");
      } else {
        setErro(data.message || "Erro ao enviar email.");
      }
    } catch (error) {
      setErro("Erro de conexão ao servidor.");
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Recuperar Password</h2>
      <p>Insera o email para receberes um link de redefinição.</p>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="O seu email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          style={{ padding: '10px', width: '250px' }}
        />
        <br /><br />
        <button type="submit" style={{ padding: '10px 20px' }}>Enviar Link</button>
      </form>

      {mensagem && <p style={{ color: 'green', marginTop: '15px' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red', marginTop: '15px' }}>{erro}</p>}
    </div>
  );
}

export default ForgotPw;