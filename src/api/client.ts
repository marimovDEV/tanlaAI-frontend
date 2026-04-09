import axios from 'axios';

const DEFAULT_BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_ORIGIN || 'https://tanla-ai.ardentsoft.uz'
).replace(/\/$/, '');

const resolveApiBaseUrl = () => {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return '/api/v1';
  }

  const sameOriginHosts = new Set([
    'localhost',
    '127.0.0.1',
    new URL(DEFAULT_BACKEND_ORIGIN).hostname,
  ]);

  if (sameOriginHosts.has(window.location.hostname)) {
    return '/api/v1';
  }

  return `${DEFAULT_BACKEND_ORIGIN}/api/v1`;
};

const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to handle authentication
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default apiClient;
