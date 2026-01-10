import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Register() {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    nome: ""
  });
  
  const [message, setMessage] = useState(""); // mensagens de sucesso
  const [error, setError] = useState("");     // mensagens de erro

  const { email, password, nome } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // Envia dados para o Back-end
      const response = await axios.post("http://localhost:5000/auth/register", {
        email,
        password,
        nome
      });

      // Se correu bem:
      setMessage("Conta criada com sucesso! Podes fazer login agora.");
      // Limpar o formulário
      setInputs({ email: "", password: "", nome: "" });

    } catch (err) {
      console.error(err.response.data);
      setError(err.response.data);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Criar Conta</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={onSubmitForm}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nome:</label>
          <input 
            type="text" name="nome" value={nome} onChange={onChange} required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input 
            type="email" name="email" value={email} onChange={onChange} required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input 
            type="password" name="password" value={password} onChange={onChange} required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Registar
        </button>
      </form>
      
      <p style={{ marginTop: '15px' }}>
        Já tens conta? <Link to="/login">Faz Login aqui</Link>
      </p>
    </div>
  );
}

export default Register;