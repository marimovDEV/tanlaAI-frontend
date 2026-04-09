import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to handle authentication
apiClient.interceptors.request.use((config) => {
  // If we had a token in localStorage, we would add it here
  // But for now, we rely on Session cookies or will send initData in the auth call
  return config;
});

export default apiClient;
