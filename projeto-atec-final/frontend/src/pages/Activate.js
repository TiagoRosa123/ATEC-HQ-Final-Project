import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Activate() {
    const { token } = useParams(); // Apanha o código do URL
    const navigate = useNavigate();
    const [mensagem, setMensagem] = useState("A ativar a tua conta...");
    const [erro, setErro] = useState(false);

    useEffect(() => {
        const ativarConta = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/activate-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok) {
                    setMensagem(data);
                    // 2 seg e manda para o login
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    setMensagem(data);
                    setErro(true);
                }
            } catch (err) {
                setMensagem("Erro ao conectar ao servidor.");
                setErro(true);
            }
        };

        if (token) {
            ativarConta();
        }
    }, [token, navigate]);

    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h2>Ativação de Conta</h2>
            <h3 style={{ color: erro ? 'red' : 'green' }}>{mensagem}</h3>
            {erro && <button onClick={() => navigate('/login')}>Voltar ao Login</button>}
        </div>
    );
}

export default Activate;