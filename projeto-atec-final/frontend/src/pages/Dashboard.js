import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Estados para o 2FA
  const [qrCode, setQrCode] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    // 1. Verificar se existe token guardado
    const token = localStorage.getItem('token');

    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      // Se não houver token, manda de volta para o login
      navigate('/login');
    } else {
      // (Opcional) Recuperar dados do user guardados no login
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 1. Pedir QR Code ao Servidor
  const iniciarSetup2FA = async () => {
    try {
      const response = await fetch('http://localhost:5000/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();
      if (data.qrCode) {
        setQrCode(data.qrCode); // Mostra a imagem
        setMensagem("Lê o QR Code com o Google Authenticator e insere o código abaixo.");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  // 2. Enviar código para ativar
  const ativar2FA = async () => {
    try {
      const response = await fetch('http://localhost:5000/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, token: codigo2fa }),
      });
      
      if (response.ok) {
        setMensagem("✅ 2FA Ativado com sucesso!");
        setQrCode(''); // Esconde o QR Code
      } else {
        setMensagem("❌ Código incorreto.");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

 return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Dashboard</h1>
      {user && <h3>Olá, {user.nome}</h3>}
      
      <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
        <h3>Segurança (2FA)</h3>
        {!qrCode && <button onClick={iniciarSetup2FA}>Ativar Autenticação de 2 Fatores</button>}
        
        {qrCode && (
          <div style={{ textAlign: 'center' }}>
            <p>1. Abre o Google Authenticator e lê isto:</p>
            <img src={qrCode} alt="QR Code 2FA" />
            <br />
            <p>2. Insere o código de 6 dígitos:</p>
            <input 
              type="text" 
              placeholder="Ex: 123456" 
              value={codigo2fa}
              onChange={(e) => setCodigo2fa(e.target.value)}
            />
            <button onClick={ativar2FA} style={{ marginLeft: '10px' }}>Confirmar</button>
          </div>
        )}
        <p style={{ fontWeight: 'bold' }}>{mensagem}</p>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '30px', background: 'red', color: 'white' }}>
        Sair
      </button>
    </div>
  );
}

export default Dashboard;