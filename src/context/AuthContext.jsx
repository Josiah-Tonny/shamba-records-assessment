import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'REFRESH_START':
      return { ...state, loading: true };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        loading: false,
        accessToken: action.payload,
        error: null
      };
    case 'REFRESH_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            dispatch({ type: 'REFRESH_START' });
            const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
            const newAccessToken = response.data.data.accessToken;

            dispatch({ type: 'REFRESH_SUCCESS', payload: newAccessToken });

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            dispatch({ type: 'REFRESH_FAILURE', payload: 'Session expired' });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Set authorization header when token changes
  useEffect(() => {
    if (state.accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.accessToken]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await axios.post('/api/auth/register', { name, email, password, role });
      // After registration, automatically log in
      await login(email, password);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};