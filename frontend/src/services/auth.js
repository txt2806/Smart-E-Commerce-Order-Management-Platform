import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.sessionKey) {
        localStorage.setItem('sessionKey', response.data.sessionKey);
      }
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.sessionKey) {
        localStorage.setItem('sessionKey', response.data.sessionKey);
      }
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  loginWithGoogle: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.sessionKey) {
        localStorage.setItem('sessionKey', response.data.sessionKey);
      }
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: async () => {
    const sessionKey = localStorage.getItem('sessionKey');
    try {
      if (sessionKey) {
        await api.post('/auth/logout', { sessionKey });
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('sessionKey');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};
