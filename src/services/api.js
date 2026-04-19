import axios from 'axios';

// Access token in memory (NOT localStorage)
let accessToken = null;

const api = axios.create({
  // Direct backend URL - use environment variable or fallback to same-origin /api
  baseURL: (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) 
    ? import.meta.env.VITE_API_URL 
    : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach access token from memory
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // CRITICAL FIX: Don't retry if already retried or if it's a refresh/auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Don't retry login, refresh or me endpoints (prevents infinite loop/unnecessary refresh)
      if (originalRequest.url.includes('/auth/login') ||
          originalRequest.url.includes('/auth/refresh') || 
          originalRequest.url.includes('/auth/me')) {
        console.log('Auth endpoint failed, not retrying:', originalRequest.url);
        
        // If it's not a login attempt and we're not on the login page, 
        // we might want to redirect, but NOT if we're in the middle of a checkAuth
        // Let the caller handle the error.
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshBaseURL = (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) 
          ? import.meta.env.VITE_API_URL 
          : '/api';

        const response = await axios.post(
          `${refreshBaseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        accessToken = response.data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log('Refresh failed, logging out');
        accessToken = null;
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export functions to manage token
export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export default api;