import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUserCog, FaSignOutAlt, FaCog, FaUser, FaClipboardList, FaBook, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Container, Navbar as BsNavbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function Navbar({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth(); // Precisa do user para saber se é Admin ou não

    const [isAdminOpen, setIsAdminOpen] = useState(true); // Começa aberto para veres

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="app-container">

            {/*Sidebar*/}
            <div className="sidebar" style={{ width: '280px', flexShrink: 0 }}>

                <div className="p-4 d-flex align-items-center mb-2">
                    <div className="fs-4 fw-bold text-white tracking-wide">
                        ATEC<span style={{ color: 'var(--accent-orange)' }}>HQ</span>
                    </div>
                </div>

                {/* Menu*/}
                <nav className="flex-column mb-auto">
                    <Link to="/dashboard" className={`nav-link-custom ${isActive('/dashboard')}`}>
                        <FaHome className="me-3" size={18} />
                        <span className="fs-6">Dashboard</span>
                    </Link>

                    {user && user.is_admin && (
                        <>
                            <div
                                className={`nav-link-custom ${location.pathname.includes('/admin') ? 'active-parent' : ''}`}
                                onClick={() => setIsAdminOpen(!isAdminOpen)}
                                style={{ cursor: 'pointer', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
                            >
                                <div className="d-flex align-items-center">
                                    <FaUserCog className="me-3" size={18} />
                                    <span className="fs-6">Administração</span>
                                </div>
                                {isAdminOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                            </div>

                            {isAdminOpen && (
                                <div className="ms-4 ps-2 mb-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Link to="/admin" className={`nav-link-custom py-2 ${location.pathname === '/admin' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                                        Utilizadores
                                    </Link>
                                    <Link to="/admin/courses" className={`nav-link-custom py-2 ${location.pathname === '/admin/courses' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                                        Cursos
                                    </Link>
                                    <Link to="/admin/areas" className={`nav-link-custom py-2 ${location.pathname === '/admin/areas' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                                        Áreas
                                    </Link>
                                </div>
                            )}
                        </>
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

                {/* Sair*/}
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

            {/*Conteudo*/}
            <div className="main-content">
                <div className="container-fluid p-0">
                    {children}
                </div>
            </div>

        </div>
    );
}

export default Navbar;
