import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';

const PublicNavbar = () => {
    return (
        <Navbar bg="white" expand="lg" className="shadow-sm py-3 fixed-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold text-dark-blue fs-4">
                    ATEC <span className="text-accent">Academy</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link href="#cursos" className="me-3 fw-medium">Cursos</Nav.Link>
                        <Nav.Link href="#sobre" className="me-3 fw-medium">Sobre Nós</Nav.Link>
                        <Nav.Link href="#contactos" className="me-4 fw-medium">Contactos</Nav.Link>
                        <Button as={Link} to="/login" variant="primary" className="btn-accent px-4 rounded-pill">
                            Login
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default PublicNavbar;
