import axios from 'axios';

// ⚠️ BaseURL sans /api pour que sanctum/csrf-cookie soit accessible
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 ESSENTIEL - envoie les cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Intercepteur pour ajouter le token après connexion
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonction pour récupérer le cookie CSRF
export const fetchCsrfCookie = async () => {
  try {
    await api.get('/sanctum/csrf-cookie');
    console.log('✅ CSRF cookie récupéré');
    return true;
  } catch (error) {
    console.error('❌ Erreur CSRF:', error);
    throw error;
  }
};

export const authApi = {
  register: async (userData) => {
    await fetchCsrfCookie(); // 🔥 Important avant chaque POST
    const response = await api.post('/api/register', userData);
    return response;
  },
  
  login: async (credentials) => {
    await fetchCsrfCookie(); // 🔥 Important avant chaque POST
    const response = await api.post('/api/login', credentials);
    
    // Stocke le token si ton API le retourne
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
  },
  
  logout: async () => {
    const response = await api.post('/api/logout');
    localStorage.removeItem('auth_token');
    return response;
  },
  
  getUser: async () => {
    const response = await api.get('/api/user');
    return response;
  },
};