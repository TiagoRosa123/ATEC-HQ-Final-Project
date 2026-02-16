import React, { useEffect } from 'react';

const TawkChat = () => {
    useEffect(() => {
        //exigida pelo Tawk_api
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        //elemento script
        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        //URL TawkTO
        s1.src = 'https://embed.tawk.to/69865a06cc2b941c350ca1cb/1jgqcvav6';
        s1.setAttribute('crossorigin', '*');
        // Inserir na página
        s0.parentNode.insertBefore(s1, s0);
    }, []); // array vazio [] faz com que corra só 1 vez
    return null;
};
export default TawkChat;