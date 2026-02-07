import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Importar ThemeProvider
import PrivateRoute from './components/PrivateRoute';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPw from './pages/ForgotPw';
import ResetPw from './pages/ResetPw';
import ActivatePw from './pages/Activate'
import LandingPage from './pages/LandingPage'; // Importar Landing Page
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import PersonalData from './pages/PersonalData';
import Evaluations from './pages/Evaluations';
import AdminCourses from './pages/AdminCourses';
import AdminAreas from './pages/AdminAreas';
import AdminModules from './pages/AdminModules';
import AdminClasses from './pages/AdminClasses';
import AdminRooms from './pages/AdminRooms';
import Schedules from './pages/Schedules';
import TawkChat from './components/TawkChat';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            {/*notificações pop-up no canto direito */}
            <Toaster position="top-right" />

            <Routes>
              {/* Rot. Publicas */}
              <Route path="/" element={<LandingPage />} />
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
              <Route path="/admin/courses" element={<PrivateRoute><AdminCourses /></PrivateRoute>} />
              <Route path="/admin/areas" element={<PrivateRoute><AdminAreas /></PrivateRoute>} />
              <Route path="/admin/modules" element={<PrivateRoute><AdminModules /></PrivateRoute>} />
              <Route path="/admin/classes" element={<PrivateRoute><AdminClasses /></PrivateRoute>} />
              <Route path="/admin/rooms" element={<PrivateRoute><AdminRooms /></PrivateRoute>} />
              <Route path="/schedules" element={<PrivateRoute><Schedules /></PrivateRoute>} />
            </Routes>
            <TawkChat />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;