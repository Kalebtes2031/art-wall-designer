// frontend/src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxy is handled in vite.config.ts
});

export default api;
