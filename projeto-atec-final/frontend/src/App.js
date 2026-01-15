import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPw from './pages/ForgotPw';
import ResetPw from './pages/ResetPw';
import ActivatePw from './pages/Activate'
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import PersonalData from './pages/PersonalData';
import Evaluations from './pages/Evaluations';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPw />} />
          <Route path="/reset-password/:token" element={<ResetPw />} />
          <Route path="/activate/:token" element={<ActivatePw />} />
          <Route path="/admin" element={<AdminUsers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<PersonalData />} />
          <Route path="/evaluations" element={<Evaluations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;