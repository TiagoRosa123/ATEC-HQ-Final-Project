import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    token2fa: "" // Novo estado para guardar o código 2FA
  });

  // Estado para controlar se mostramos o campo de 2FA ou não
  const [show2FAInput, setShow2FAInput] = useState(false);
  
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { email, password, token2fa } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setError(""); // Limpar erros anteriores

    try {
      // Envia email, password (e token2fa se já estiver preenchido)
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
        token2fa: show2FAInput ? token2fa : undefined // Só envia se estivermos no passo 2
      });

      // SUCESSO! Temos token de sessão
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("Login efetuado!");
        navigate("/dashboard"); 
      }

    } catch (err) {
      // Apanhar a resposta do servidor
      if (err.response) {
        const serverData = err.response.data;
        
        // VERIFICAÇÃO ESPECIAL: O servidor pediu 2FA?
        if (err.response.status === 400 && serverData.require2fa) {
          setShow2FAInput(true); // Mostra o campo de código
          setError("Por favor, insere o teu código 2FA da App.");
          return; // Para aqui e espera que o user preencha o código e clique de novo
        }

        // Se for outro erro qualquer (ex: password errada)
        setError(serverData.msg || serverData || "Erro ao fazer login");
      } else {
        setError("Erro de ligação ao servidor");
      }
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{show2FAInput ? "Autenticação 2FA" : "Login"}</h2>
      
      {error && <p style={{ color: error.includes("sucesso") ? 'green' : 'red' }}>{error}</p>}
      
      <form onSubmit={onSubmitForm}>
        {/* Se NÃO estiver a pedir 2FA, mostra email e pass normalmente */}
        {!show2FAInput && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label>
              <input 
                type="email" name="email" value={email} onChange={onChange} required 
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Password:</label>
              <input 
                type="password" name="password" value={password} onChange={onChange} required 
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          </>
        )}

        {/* Se o servidor pediu 2FA, ESCONDE email/pass e MOSTRA só o código */}
        {show2FAInput && (
          <div style={{ marginBottom: '10px', backgroundColor: '#e9f7ef', padding: '15px', borderRadius: '5px' }}>
            <label style={{ fontWeight: 'bold' }}>Código Google Authenticator:</label>
            <input 
              type="text" 
              name="token2fa" 
              value={token2fa} 
              onChange={onChange} 
              placeholder="Ex: 123456"
              autoFocus
              required 
              style={{ width: '100%', padding: '10px', fontSize: '18px', letterSpacing: '2px', textAlign: 'center' }}
            />
          </div>
        )}

        <button type="submit" style={{ width: '100%', padding: '10px', background: show2FAInput ? '#28a745' : '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          {show2FAInput ? "Verificar Código" : "Entrar"}
        </button>
      </form>
      
      <p style={{ marginTop: '15px' }}>
        Não tens conta? <Link to="/register">Regista-te aqui</Link>
      </p>
    </div>
  );
}

export default Login;