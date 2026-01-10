import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Se tiveres um ficheiro CSS podes importar aqui, ou usar estilos inline por agora

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login tentado com:", email, password);
    // Aqui virá a lógica de conexão ao Backend mais tarde
  };

  return (
    <div className="auth-container">
      <h2>Bem-vindo de volta!</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder="exemplo@email.com"
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            placeholder="********"
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
      
      <p>
        Não tens conta? <Link to="/register">Regista-te aqui</Link>
      </p>
    </div>
  );
}

export default Login;