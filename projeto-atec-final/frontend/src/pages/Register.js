import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: ''
  });

  // ESTA ERA A LINHA QUE FALTAVA:
  const [mensagem, setMensagem] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Confirma se a porta é 5000 ou 3001 no teu PC
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Conta criada com sucesso! A redirecionar...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMensagem(data.message || 'Erro ao criar conta.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  return (
    <div className="container">
      <h2>Criar Conta</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" onChange={handleChange} required />
        </div>
        <button type="submit">Registar</button>
      </form>
      {/* Aqui usamos a mensagem para mostrar erros ou sucesso */}
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default Register;