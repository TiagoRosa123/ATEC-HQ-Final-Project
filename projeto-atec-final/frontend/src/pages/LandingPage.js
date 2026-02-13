import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaSearch, FaGraduationCap } from 'react-icons/fa';
import axios from 'axios';
import PublicNavbar from '../components/PublicNavbar';

const LandingPage = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedArea, setSelectedArea] = useState("Todas");
    const [areas, setAreas] = useState([]);
    const [showUpcoming, setShowUpcoming] = useState(false); // Estado para o filtro de 60 dias

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/public/courses');
            setCourses(res.data);
            setFilteredCourses(res.data);

            // Extrair áreas únicas
            const uniqueAreas = ["Todas", ...new Set(res.data.map(c => c.area_nome).filter(Boolean))]; // Use area_nome from backend
            setAreas(uniqueAreas);
        } catch (err) {
            console.error("Erro ao carregar cursos:", err);
        }
    };

    useEffect(() => {
        let result = courses;

        if (selectedArea !== "Todas") {
            result = result.filter(c => c.area_nome === selectedArea);
        }

        if (searchTerm) {
            result = result.filter(c =>
                c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.descricao && c.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filtro "Próximos 60 dias"
        if (showUpcoming) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const sixtyDaysFromNow = new Date();
            sixtyDaysFromNow.setDate(today.getDate() + 60);

            result = result.filter(c => {
                if (!c.proxima_data_inicio) return false;
                const startDate = new Date(c.proxima_data_inicio);
                return startDate >= today && startDate <= sixtyDaysFromNow;
            });
        }

        setFilteredCourses(result);
    }, [searchTerm, selectedArea, courses, showUpcoming]);

    return (
        <div className="min-vh-100 pb-5">
            <PublicNavbar />

            {/* Hero Section */}
            <div className="py-5 mb-5 text-center text-white" style={{ backgroundColor: 'var(--primary-blue)' }}>
                <Container>
                    <h1 className="display-4 fw-bold mb-3">Bem-vindo à <b>ATEC HeadQuarter</b></h1>
                    <p className="lead mb-4">Descobre o teu futuro com os nossos cursos.</p>
                </Container>
            </div>

            <Container id="courses">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-3 mb-md-0">
                        Cursos Disponíveis
                    </h2>

                    <div className="d-flex gap-3 align-items-center flex-wrap">
                        {/* Checkbox 60 Dias */}
                        <Form.Check
                            type="switch"
                            id="upcoming-switch"
                            label="A iniciar em breve"
                            className="me-3 fw-bold text-secondary upcoming-label"
                            checked={showUpcoming}
                            onChange={(e) => setShowUpcoming(e.target.checked)}
                        />
                        <Form.Select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            style={{ width: '200px' }}
                            className="shadow-sm border-0"
                        >
                            {areas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </Form.Select>

                        <InputGroup style={{ width: '250px' }} className="shadow-sm">
                            <InputGroup.Text className="bg-white border-0"><FaSearch className="text-muted" /></InputGroup.Text>
                            <Form.Control
                                placeholder="Pesquisar curso..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-0"
                            />
                        </InputGroup>
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <h4>Nenhum curso encontrado.</h4>
                    </div>
                ) : (
                    <Row>
                        {filteredCourses.map(course => (
                            <Col key={course.id} md={6} lg={4} className="mb-4">
                                <Card className="h-100 border-0 shadow-sm hover-up transition-all">
                                    <div className="position-relative">
                                        {/* Placeholder de imagem se não existir */}
                                        <div style={{ height: '180px', backgroundColor: 'var(--bg-page)' }} className="d-flex align-items-center justify-content-center text-muted border-bottom">
                                            {course.imagem ?
                                                <img src={course.imagem} alt={course.nome} className="w-100 h-100 object-fit-cover" />
                                                : <FaGraduationCap size={40} opacity={0.3} />
                                            }
                                        </div>
                                        {/* Badge de Próxima Data */}
                                        {course.proxima_data_inicio && (
                                            <Badge bg="success" className="position-absolute bottom-0 start-0 m-3 shadow-sm">
                                                Inicia a: {new Date(course.proxima_data_inicio).toLocaleDateString('pt-PT')}
                                            </Badge>
                                        )}
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="fw-bold text-truncate course-title" title={course.nome}>{course.nome}</Card.Title>
                                        <Card.Text className="text-muted small flex-grow-1">
                                            {course.descricao ?
                                                (course.descricao.length > 100 ? course.descricao.substring(0, 100) + "..." : course.descricao)
                                                : "Sem descrição disponível."
                                            }
                                        </Card.Text>
                                        <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                {course.duracao_horas ? `Duração: ${course.duracao_horas} Horas` : 'Duração N/A'}
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            <style>{`
                .hover-up { transition: transform 0.2s; }
                .hover-up:hover { transform: translateY(-5px); }
            `}</style>
        </div>
    );
};

export default LandingPage;
