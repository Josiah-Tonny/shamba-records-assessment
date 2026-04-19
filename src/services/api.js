import axios from 'axios';

// Access token stored in memory only (not localStorage)
let accessToken = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true, // Sends httpOnly cookies automatically
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
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Call refresh endpoint - httpOnly cookie sent automatically
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Store new access token in memory
        accessToken = response.data.accessToken;
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear memory and redirect
        accessToken = null;
        window.location.href = '/login';
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