import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaCog, FaUser, FaClipboardList, FaCalendarAlt, FaTools, FaUsers, FaBook, FaLayerGroup, FaChalkboardTeacher, FaDoorOpen } from 'react-icons/fa';
import { Container, Navbar as BsNavbar, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

function Navbar({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isActive = (path) => location.pathname === path ? 'active fw-bold text-primary' : '';

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Top Navbar */}
            <BsNavbar expand="lg" className="shadow-sm py-3 mb-4 bg-body-tertiary">
                <Container>
                    <BsNavbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center fw-bold">
                        <span className="text-secondary brand-atec">ATEC</span><span style={{ color: 'var(--primary-blue)' }}>HQ</span>
                    </BsNavbar.Brand>

                    <BsNavbar.Toggle aria-controls="private-navbar-nav" />

                    <BsNavbar.Collapse id="private-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard')}></Nav.Link>

                            {/* Menu Administrativo */}
                            {user && (user.is_admin || user.role === 'secretaria') && (
                                <NavDropdown title={<span><FaTools className="me-1" /> Administração</span>} id="admin-nav-dropdown">
                                    {user.is_admin && (
                                        <NavDropdown.Item as={Link} to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                                            <FaUsers className="me-2" /> Utilizadores
                                        </NavDropdown.Item>
                                    )}
                                    <NavDropdown.Item as={Link} to="/admin/courses">
                                        <FaBook className="me-2" /> Cursos
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/modules">
                                        <FaLayerGroup className="me-2" /> Módulos
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/areas">
                                        <FaChalkboardTeacher className="me-2" /> Áreas
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/classes">
                                        <FaUsers className="me-2" /> Turmas
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/rooms">
                                        <FaDoorOpen className="me-2" /> Salas
                                    </NavDropdown.Item>
                                </NavDropdown>
                            )}

                            {/* Links Comuns */}
                            {user && (user.is_admin || user.role === 'formador' || user.role === 'secretaria') && (
                                <Nav.Link as={Link} to="/evaluations" className={isActive('/evaluations')}>
                                    <FaClipboardList className="me-1" /> Avaliações
                                </Nav.Link>
                            )}

                            {user && (user.is_admin || user.role === 'formador' || user.role === 'formando' || user.role === 'secretaria') && (
                                <Nav.Link as={Link} to="/schedules" className={isActive('/schedules')}>
                                    <FaCalendarAlt className="me-1" /> Horários
                                </Nav.Link>
                            )}
                        </Nav>

                        {/* Lado Direito */}
                        <Nav className="align-items-center">
                            <div className="me-3">
                                <ThemeToggle />
                            </div>

                            <NavDropdown
                                title={
                                    <div className="d-inline-flex align-items-center">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 overflow-hidden" style={{ width: '32px', height: '32px' }}>
                                            {user?.foto ? (
                                                <img src={user.foto} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                user?.nome?.charAt(0).toUpperCase() || <FaUser />
                                            )}
                                        </div>
                                        <span>{user?.nome?.split(' ')[0]}</span>
                                    </div>
                                }
                                id="user-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/profile">
                                    <FaUser className="me-2" /> Dados Pessoais
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/settings">
                                    <FaCog className="me-2" /> Configurações
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                    <FaSignOutAlt className="me-2" /> Sair
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </BsNavbar.Collapse>
                </Container>
            </BsNavbar>

            {/* Main Content */}
            <div className="flex-grow-1">
                <Container fluid={false} className="pb-5">
                    {children}
                </Container>
            </div>

            <footer className="py-4 text-center text-muted small bg-body-tertiary mt-auto">
                © 2026 ATECHQ Academia de Formação
            </footer>
        </div>
    );
}

export default Navbar;