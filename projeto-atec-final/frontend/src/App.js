import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Vamos criar estes componentes já a seguir!
// Por enquanto, deixamos comentado para não dar erro
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota inicial redireciona para Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<h1>Página de Login</h1>} />
          <Route path="/register" element={<h1>Página de Registo</h1>} />
          <Route path="/dashboard" element={<h1>Área Privada</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;