import React from 'react';
import { Button } from 'react-bootstrap';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme(); // Usa Contexto Global

    return (
        <Button
            variant={theme === 'light' ? 'outline-secondary' : 'outline-light'}
            onClick={toggleTheme}
            className="rounded-circle p-2 mx-2 d-flex align-items-center justify-content-center"
            title={theme === 'light' ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
            style={{ width: '40px', height: '40px' }}
        >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
        </Button>
    );
};

export default ThemeToggle;
