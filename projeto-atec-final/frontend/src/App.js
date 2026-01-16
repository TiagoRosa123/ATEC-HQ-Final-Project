import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

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
    <AuthProvider>
      <Router>
        <div className="App">
          {/*notificações pop-up no canto direito */}
          <Toaster position="top-right" />

          <Routes>
            {/* Rot. Publicas */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPw />} />
            <Route path="/reset-password/:token" element={<ResetPw />} />
            <Route path="/activate/:token" element={<ActivatePw />} />
            {/* Rot. Privadas */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><PersonalData /></PrivateRoute>} />
            <Route path="/evaluations" element={<PrivateRoute><Evaluations /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;