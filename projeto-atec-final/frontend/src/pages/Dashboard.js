import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode'; // <--- Importante: verifica se tens esta linha

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nome: '', email: '', id: '', two_fa_ativado: false });
  
  // --- ESTADOS PARA MUDAR PASSWORD ---
  const [novaPassword, setNovaPassword] = useState('');
  const [msgPass, setMsgPass] = useState('');

  // --- ESTADOS PARA O 2FA ---
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretAscii, setSecretAscii] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');
  const [modoSetup2FA, setModoSetup2FA] = useState(false);
  const [msg2FA, setMsg2FA] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- 1. FUNÇÃO MUDAR PASSWORD ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsgPass('');
    if (!novaPassword) return;

    try {
      const response = await fetch('http://localhost:5000/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, password: novaPassword }),
      });

      if (response.ok) {
        setMsgPass("✅ Password alterada!");
        setNovaPassword('');
      } else {
        setMsgPass("❌ Erro ao alterar.");
      }
    } catch (error) { console.error(error); }
  };

  // --- 2. FUNÇÕES 2FA ---
  const iniciarSetup2FA = async () => {
    try {
      // 1. Pedir segredo ao backend
      const res = await fetch('http://localhost:5000/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      
      // 2. Gerar QR Code para mostrar no ecrã
      setSecretAscii(data.secret);
      const urlImagem = await QRCode.toDataURL(data.otpauthUrl);
      setQrCodeUrl(urlImagem);
      setModoSetup2FA(true);
      setMsg2FA('');
    } catch (err) {
      console.error(err);
    }
  };

  const confirmar2FA = async () => {
    try {
      // 3. Enviar o código que o user leu para confirmar
      const res = await fetch('http://localhost:5000/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, token: codigo2fa, secret: secretAscii })
      });

      if (res.ok) {
        setMsg2FA("✅ 2FA Ativado com sucesso!");
        setModoSetup2FA(false);
        const updatedUser = { ...user, two_fa_ativado: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setMsg2FA("❌ Código incorreto.");
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Olá, {user.nome}! 👋</h1>
        <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          Sair
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* BLOCO DA ESQUERDA: PASSWORD */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>🔐 Alterar Password</h3>
          <form onSubmit={handleChangePassword}>
            <input 
              type="password" 
              placeholder="Nova Password" 
              value={novaPassword} 
              onChange={(e) => setNovaPassword(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Atualizar
            </button>
          </form>
          {msgPass && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{msgPass}</p>}
        </div>

        {/* BLOCO DA DIREITA: 2FA */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3>🛡️ Segurança (2FA)</h3>
          
          {user.two_fa_ativado ? (
            <p style={{ color: 'green', fontWeight: 'bold' }}>✅ O 2FA está ATIVO na tua conta.</p>
          ) : (
            <>
              <p>Protege a tua conta com Autenticação de Dois Fatores.</p>
              {!modoSetup2FA && (
                <button onClick={iniciarSetup2FA} style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Ativar 2FA Agora
                </button>
              )}
            </>
          )}

          {modoSetup2FA && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p>1. Lê este QR Code com o Google Authenticator:</p>
              <img src={qrCodeUrl} alt="QR Code" style={{ border: '1px solid #ccc', padding: '5px', background: 'white' }} />
              
              <p>2. Insere o código gerado:</p>
              <input 
                type="text" 
                placeholder="000 000" 
                value={codigo2fa}
                onChange={(e) => setCodigo2fa(e.target.value)}
                style={{ padding: '8px', width: '100px', textAlign: 'center', fontSize: '1.2em' }}
              />
              <br/><br/>
              <button onClick={confirmar2FA} style={{ padding: '10px 20px' }}>Confirmar</button>
              {msg2FA && <p style={{ color: 'red' }}>{msg2FA}</p>}
            </div>
          )}
          
          {msg2FA && user.two_fa_ativado && <p style={{ marginTop: '10px', color: 'green' }}>{msg2FA}</p>}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;