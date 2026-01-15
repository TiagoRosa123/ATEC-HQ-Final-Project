import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import Navbar from '../components/Navbar';
import { Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { FaShieldAlt, FaKey, FaCog } from 'react-icons/fa';

function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nome: '', email: '', id: '', two_fa_ativado: false });

    // Password State
    const [novaPassword, setNovaPassword] = useState('');
    const [msgPass, setMsgPass] = useState('');
    const [msgTypePass, setMsgTypePass] = useState('');

    // 2FA State
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secretAscii, setSecretAscii] = useState('');
    const [codigo2fa, setCodigo2fa] = useState('');
    const [modoSetup2FA, setModoSetup2FA] = useState(false);
    const [msg2FA, setMsg2FA] = useState('');
    const [msgType2FA, setMsgType2FA] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token) {
            navigate('/login');
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    // --- PASSWORD CHANGE ---
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMsgPass('');
        if (!novaPassword) return;

        try {
            const response = await fetch('http://localhost:5000/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, password: novaPassword }),
            });

            if (response.ok) {
                setMsgPass("Password alterada com sucesso.");
                setMsgTypePass("success");
                setNovaPassword('');
            } else {
                setMsgPass("Erro ao alterar password.");
                setMsgTypePass("danger");
            }
        } catch (error) { console.error(error); }
    };

    // --- 2FA SETUP ---
    const iniciarSetup2FA = async () => {
        try {
            const res = await fetch('http://localhost:5000/auth/2fa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            const data = await res.json();

            setSecretAscii(data.secret);
            const urlImagem = await QRCode.toDataURL(data.otpauthUrl);
            setQrCodeUrl(urlImagem);
            setModoSetup2FA(true);
            setMsg2FA('');
        } catch (err) {
            console.error(err);
        }
    };

    const confirmar2FA = async () => {
        try {
            const res = await fetch('http://localhost:5000/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, token: codigo2fa, secret: secretAscii })
            });

            if (res.ok) {
                setMsg2FA("Autenticação 2FA ativada com sucesso!");
                setMsgType2FA("success");
                setModoSetup2FA(false);
                const updatedUser = { ...user, two_fa_ativado: true };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                setMsg2FA("Código incorreto. Tenta novamente.");
                setMsgType2FA("danger");
            }
        } catch (err) { console.error(err); }
    };

    return (
        <Navbar>
            <div className="d-flex align-items-center mb-5">
                <div className="bg-white p-2 rounded shadow-sm me-3">
                    <FaCog size={24} className="text-secondary" />
                </div>
                <div>
                    <h2 className="fw-bold text-dark-blue mb-0">Configurações</h2>
                    <p className="text-secondary mb-0">Gerir segurança e preferências da conta.</p>
                </div>
            </div>

            <Row className="g-4">
                {/* PASSWORD CHANGE */}
                <Col lg={6}>
                    <Card className="card-modern h-100 border-0">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <div className="d-flex align-items-center">
                                <FaKey className="text-secondary me-2" />
                                <h6 className="fw-bold mb-0 text-uppercase ls-1 small">Alterar Password</h6>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted small mb-4">Escolhe uma password forte para proteger a tua conta.</p>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-floating mb-3">
                                    <input
                                        type="password"
                                        className="form-control bg-light border-0"
                                        id="floatingPassword"
                                        placeholder="Nova Password"
                                        value={novaPassword}
                                        onChange={(e) => setNovaPassword(e.target.value)}
                                    />
                                    <label htmlFor="floatingPassword">Nova Password</label>
                                </div>
                                <Button type="submit" className="btn-primary-custom w-100">
                                    Atualizar Credenciais
                                </Button>
                            </form>
                            {msgPass && <Alert variant={msgTypePass} className="mt-3 border-0 small fw-bold text-center">{msgPass}</Alert>}
                        </Card.Body>
                    </Card>
                </Col>

                {/* 2FA SECURITY */}
                <Col lg={6}>
                    <Card className="card-modern h-100 border-0">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <div className="d-flex align-items-center">
                                <FaShieldAlt className="text-secondary me-2" />
                                <h6 className="fw-bold mb-0 text-uppercase ls-1 small">Autenticação 2FA</h6>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted small mb-4">Adiciona uma camada extra de segurança.</p>

                            {user.two_fa_ativado ? (
                                <div className="p-4 bg-light rounded text-center border dashed-border">
                                    <FaShieldAlt size={40} className="text-success mb-3" />
                                    <h6 className="fw-bold text-success">Proteção Ativa</h6>
                                    <p className="small text-muted mb-0">A tua conta está protegida com autenticação de dois fatores.</p>
                                </div>
                            ) : (
                                <div>
                                    {!modoSetup2FA && (
                                        <div className="text-center p-4">
                                            <Button variant="outline-dark" onClick={iniciarSetup2FA} className="fw-bold px-4 py-2">
                                                Configurar 2FA
                                            </Button>
                                            <p className="text-muted small mt-2">Será necessário a app Google Authenticator.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modoSetup2FA && (
                                <div className="text-center mt-0 animate-fade-in bg-light p-3 rounded">
                                    <p className="small fw-bold mb-2">1. Lê o QR Code:</p>
                                    <div className="bg-white p-2 border rounded d-inline-block mb-3 shadow-sm">
                                        <img src={qrCodeUrl} alt="QR Code" width="130" />
                                    </div>

                                    <p className="small fw-bold mb-2">2. Valida o código:</p>
                                    <div className="d-flex gap-2 justify-content-center">
                                        <input
                                            type="text"
                                            className="form-control text-center fw-bold border-0 shadow-sm"
                                            placeholder="000 000"
                                            value={codigo2fa}
                                            onChange={(e) => setCodigo2fa(e.target.value)}
                                            style={{ width: '120px', letterSpacing: '2px' }}
                                        />
                                        <Button onClick={confirmar2FA} className="btn-accent shadow-sm">Validar</Button>
                                    </div>
                                </div>
                            )}
                            {msg2FA && <Alert variant={msgType2FA} className="mt-3 border-0 small fw-bold text-center">{msg2FA}</Alert>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Navbar>
    );
}

export default Settings;
