import axios from 'axios';

let accessToken = null;
let refreshPromise = null;

const resolveBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredBaseUrl) {
    return '/api';
  }

  if (configuredBaseUrl.startsWith('http://') || configuredBaseUrl.startsWith('https://')) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  return configuredBaseUrl.startsWith('/') ? configuredBaseUrl : `/${configuredBaseUrl}`;
};

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const shouldSkipRefresh = (url = '') => {
  return ['/auth/login', '/auth/register', '/auth/refresh'].some((endpoint) => url.includes(endpoint));
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry || error.response?.status !== 401 || shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
          .then((response) => {
            accessToken = response.data.accessToken;
            return accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshedAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      accessToken = null;

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export default api;
