import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUserCog, FaSignOutAlt, FaCog, FaUser, FaClipboardList } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

import { useAuth } from '../context/AuthContext';

function Navbar({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="app-container">

            {/* --- SIDEBAR --- */}
            <div className="sidebar" style={{ width: '280px', flexShrink: 0 }}>

                {/* BRANDING */}
                <div className="p-4 d-flex align-items-center mb-2">
                    <div className="fs-4 fw-bold text-white tracking-wide">
                        ATEC<span style={{ color: 'var(--accent-orange)' }}>HQ</span>
                    </div>
                </div>

                {/* MENU */}
                <nav className="flex-column mb-auto">
                    <Link to="/dashboard" className={`nav-link-custom ${isActive('/dashboard')}`}>
                        <FaHome className="me-3" size={18} />
                        <span className="fs-6">Dashboard</span>
                    </Link>

                    {user && user.is_admin && (
                        <Link to="/admin" className={`nav-link-custom ${isActive('/admin')}`}>
                            <FaUserCog className="me-3" size={18} />
                            <span className="fs-6">Administração</span>
                        </Link>
                    )}

                    {user && !user.is_admin && (
                        <Link to="/evaluations" className={`nav-link-custom ${isActive('/evaluations')}`}>
                            <FaClipboardList className="me-3" size={18} />
                            <span className="fs-6">Avaliações</span>
                        </Link>
                    )}

                    <Link to="/profile" className={`nav-link-custom ${isActive('/profile')}`}>
                        <FaUser className="me-3" size={18} />
                        <span className="fs-6">Dados pessoais</span>
                    </Link>

                    <Link to="/settings" className={`nav-link-custom ${isActive('/settings')}`}>
                        <FaCog className="me-3" size={18} />
                        <span className="fs-6">Configurações</span>
                    </Link>
                </nav>

                {/* FOOTER / LOGOUT */}
                <div className="p-4 border-top border-secondary">
                    <Button
                        variant="link"
                        onClick={handleLogout}
                        className="w-100 d-flex align-items-center justify-content-center text-decoration-none"
                        style={{ color: '#ef4444', fontWeight: '600' }}
                    >
                        <FaSignOutAlt className="me-2" /> Sair
                    </Button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="main-content">
                {/* Top Header/Breadcrumb could go here if needed, keeping it simple for now */}
                <div className="container-fluid p-0">
                    {children}
                </div>
            </div>

        </div>
    );
}

export default Navbar;
