import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';


const PublicNavbar = () => {
    return (
        <Navbar className="shadow-sm py-3 mb-4 bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold">
                    <div className="fs-3 fw-bold tracking-wide">
                        <span className="text-secondary brand-atec">ATEC</span><span style={{ color: 'var(--primary-blue)' }}>HQ</span>
                    </div>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="public-navbar-nav" />

                <Navbar.Collapse id="public-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <ThemeToggle />
                        <Button
                            as={Link}
                            to="/login"
                            variant="secondary"
                            className="ms-3 px-4 rounded-pill d-flex align-items-center">
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
