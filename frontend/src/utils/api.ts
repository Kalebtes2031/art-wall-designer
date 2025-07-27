import axios from 'axios';

const isDev = import.meta.env.DEV;
const prodBase = import.meta.env.VITE_API_BASE_URL; 
// ← set this in Render as: https://art-wall-designer.onrender.com

const api = axios.create({
  baseURL: isDev
    ? '/api'          // use Vite proxy in dev
    : `${prodBase}/api`,       // use Render URL in prod
});

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  return config;
});

export default api;
