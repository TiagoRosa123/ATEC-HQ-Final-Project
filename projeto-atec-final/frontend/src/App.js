import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota inicial -> Login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<h1>Página de Login</h1>} />
          <Route path="/register" element={<h1>Página de Registo</h1>} />
          <Route path="/dashboard" element={<h1>Área Privada</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;