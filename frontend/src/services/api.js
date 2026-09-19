import axios from 'axios';

// Dynamically determine baseURL:
// When served via Nginx (port 80 or production), use '/api' for same-origin routing.
// When running in Vite dev server (port 5173), fallback to direct backend url.
const isViteDev = typeof window !== 'undefined' && window.location.port === '5173';
const apiBaseUrl = isViteDev ? 'http://localhost:8080/api' : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach latest single-use token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor:
// 1. Capture and rotate next single-use token from response header (X-Next-Access-Token)
// 2. On 401/403 token expiration, seamlessly re-acquire a fresh token using database sessionKey
api.interceptors.response.use(
  (response) => {
    const nextToken = response.headers['x-next-access-token'] || response.headers['X-Next-Access-Token'];
    if (nextToken) {
      localStorage.setItem('token', nextToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isAuthEndpoint = originalRequest.url && (
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/register') ||
        originalRequest.url.includes('/auth/renew-token')
      );

      const sessionKey = localStorage.getItem('sessionKey');

      if (!originalRequest._retry && !isAuthEndpoint && sessionKey) {
        originalRequest._retry = true;
        try {
          // Re-acquire fresh one-time token from database session
          const renewResponse = await axios.post(`${apiBaseUrl}/auth/renew-token`, { sessionKey });
          if (renewResponse.data && renewResponse.data.token) {
            const freshToken = renewResponse.data.token;
            localStorage.setItem('token', freshToken);
            originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
            return api(originalRequest);
          }
        } catch (renewError) {
          // Session expired or revoked in database
          localStorage.removeItem('token');
          localStorage.removeItem('sessionKey');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(renewError);
        }
      } else if (isAuthEndpoint) {
        return Promise.reject(error);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('sessionKey');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
