import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxy handled by Vite
});

// ✅ Attach token automatically (if present)
// ✅ Detect FormData and set multipart header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If we're sending a FormData payload, let the browser set the right boundaries
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  return config;
});

export default api;
