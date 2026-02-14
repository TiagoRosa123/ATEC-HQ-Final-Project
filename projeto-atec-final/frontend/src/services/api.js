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

// Interceptor de resposta: se 403 (token expirado), tenta refresh
let isRefreshing = false;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se a resposta for 403 e não for a própria rota de refresh, tenta renovar
    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post('http://localhost:5000/auth/refresh-token', {}, {
            headers: { token }
          });
          const newToken = res.data.token;
          localStorage.setItem('token', newToken);
          originalRequest.headers.token = newToken;
          return api(originalRequest);
        } catch (refreshErr) {
          // Refresh falhou — força logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

// Refresh preventivo: renova token a cada 45 minutos enquanto a app estiver ativa
setInterval(async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await api.post('/auth/refresh-token');
    localStorage.setItem('token', res.data.token);
  } catch (err) {
    // silencioso — o interceptor trata se o token expirar
  }
}, 45 * 60 * 1000); // 45 min

export default api;