import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaSignInAlt } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const PublicNavbar = () => {
    return (
        <Navbar className="shadow-sm py-3 mb-4 bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold text-primary">
                    <FaGraduationCap className="me-2 fs-2" />
                    ATEC
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="public-navbar-nav" />
                
                <Navbar.Collapse id="public-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link as={Link} to="/" className="mx-2 fw-medium">Início</Nav.Link>
                        <Nav.Link href="#courses" className="mx-2 fw-medium">Cursos</Nav.Link>
                        <ThemeToggle />
                        
                        <Button 
                            as={Link} 
                            to="/login" 
                            variant="primary" 
                            className="ms-3 px-4 rounded-pill d-flex align-items-center"
                        >
                            <FaSignInAlt className="me-2" />
                            Login
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default PublicNavbar;
