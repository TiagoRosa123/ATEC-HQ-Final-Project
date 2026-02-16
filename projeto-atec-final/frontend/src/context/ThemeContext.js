import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    //Estado do Tema: Lê do localStorage ou usa 'light' como padrão
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Efeito: Atualiza o atributo data-bs-theme no HTML sempre que o tema muda
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Função para alternar entre claro/escuro
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
