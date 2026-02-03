import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Card, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import PublicNavbar from '../components/PublicNavbar';
import { FaSearch, FaClock, FaCalendarAlt } from 'react-icons/fa';

const LandingPage = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicCourses();
    }, []);

    useEffect(() => {
        const results = courses.filter(course =>
            course.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.area_nome?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(results);
    }, [searchTerm, courses]);

    const fetchPublicCourses = async () => {
        try {
            // Rota pública sem necessidade de token
            const res = await axios.get('http://localhost:5000/courses/public');
            setCourses(res.data);
            setFilteredCourses(res.data);
        } catch (error) {
            console.error("Erro ao buscar cursos:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PublicNavbar />
            
            {/* Hero Section */}
            <div className="bg-dark text-white py-5 mt-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(30, 58, 138, 0.8)), url("https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80") center/cover no-repeat' }}>
                <Container className="text-center">
                    <h1 className="display-3 fw-bold mb-4">Invista no seu <span className="text-accent">Futuro</span></h1>
                    <p className="lead mb-5 mx-auto" style={{ maxWidth: '700px' }}>
                        Descubra os melhores cursos tecnológicos e especialize-se nas áreas com maior procura no mercado de trabalho.
                    </p>
                    <Button href="#cursos" variant="primary" size="lg" className="btn-accent px-5 py-3 rounded-pill fw-bold">
                        Ver Cursos Disponíveis
                    </Button>
                </Container>
            </div>

            {/* Courses Section */}
            <div id="cursos" className="py-5 bg-light">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold mb-3">Nossos Cursos</h2>
                        <div className="d-flex justify-content-center">
                            <div className="position-relative" style={{ maxWidth: '500px', width: '100%' }}>
                                <Form.Control
                                    type="text"
                                    placeholder="Pesquisar curso, área ou sigla..."
                                    className="py-3 ps-5 rounded-pill shadow-sm border-0"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center">A carregar cursos...</p>
                    ) : (
                        <Row className="g-4">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map(course => (
                                    <Col key={course.id} lg={4} md={6}>
                                        <Card className="h-100 border-0 shadow-sm hover-up card-modern">
                                            <Card.Body className="d-flex flex-column p-4">
                                                <div className="mb-3 d-flex justify-content-between align-items-start">
                                                    <Badge bg="light" text="dark" className="border">
                                                        {course.area_nome || 'Geral'}
                                                    </Badge>
                                                    {course.sigla && <Badge bg="primary">{course.sigla}</Badge>}
                                                </div>
                                                <Card.Title className="fw-bold text-dark-blue mb-3 fs-5">
                                                    {course.nome}
                                                </Card.Title>
                                                <Card.Text className="text-muted flex-grow-1 small line-clamp-3">
                                                    {course.descricao || 'Sem descrição disponível.'}
                                                </Card.Text>
                                                <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center text-muted small">
                                                    <span><FaCalendarAlt className="me-1" /> Candidaturas Abertas</span>
                                                    <Link to="/login" className="text-accent fw-bold text-decoration-none">
                                                        Saber Mais &rarr;
                                                    </Link>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col xs={12} className="text-center py-5">
                                    <h5 className="text-muted">Nenhum curso encontrado para "{searchTerm}"</h5>
                                    <Button variant="link" onClick={() => setSearchTerm('')}>Limpar pesquisa</Button>
                                </Col>
                            )}
                        </Row>
                    )}
                </Container>
            </div>

            {/* Footer Simple */}
            <footer className="bg-white py-4 mt-auto border-top">
                <Container className="text-center text-muted small">
                    <p className="mb-0">&copy; 2026 ATEC Academy. Todos os direitos reservados.</p>
                </Container>
            </footer>

            <style>{`
                .hover-up { transition: transform 0.2s; }
                .hover-up:hover { transform: translateY(-5px); }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
};


export default LandingPage;
