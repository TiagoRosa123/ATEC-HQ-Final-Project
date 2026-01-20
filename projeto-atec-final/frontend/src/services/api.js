import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', //porta servidor Back-end
});

// Intercetor: Antes de cada pedido, ver se temos token e adicionar ao cabeçalho
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.token = token; // O nome 'token' tem de bater certo com o teu middleware do server
  }
  return config;
});

export default api;