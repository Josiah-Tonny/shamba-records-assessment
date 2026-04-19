import { createContext, useReducer, useEffect } from 'react';
import api, { configureRefresh, setAuthToken } from '../services/api';

export const AuthContext = createContext();

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
        accessToken: action.payload.accessToken,
        user: action.payload.user || state.user,
        isAuthenticated: true,
        error: null
      };
    case 'REFRESH_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null // Silent failure — user must log in
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true, // Remain loading until we check the session cookie
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Attempt to restore session on mount via httpOnly refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        dispatch({ type: 'REFRESH_START' });
        const refreshResponse = await api.post('/auth/refresh', {});
        const { accessToken } = refreshResponse.data.data;
        setAuthToken(accessToken);

        // Fetch current user profile with the new token
        const meResponse = await api.get('/auth/me');
        const user = meResponse.data.data.user;

        dispatch({ type: 'REFRESH_SUCCESS', payload: { accessToken, user } });
      } catch {
        // No valid session found — user needs to log in
        dispatch({ type: 'REFRESH_FAILURE' });
      }
    };

    restoreSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Configure token auto-refresh callback for the axios interceptor
  useEffect(() => {
    configureRefresh(async () => {
      try {
        const response = await api.post('/auth/refresh', {});
        const newAccessToken = response.data.data.accessToken;
        dispatch({ type: 'REFRESH_SUCCESS', payload: { accessToken: newAccessToken } });
        return newAccessToken;
      } catch (error) {
        dispatch({ type: 'REFRESH_FAILURE' });
        throw error;
      }
    });
  }, []);

  // Keep axios default header in sync with access token
  useEffect(() => {
    setAuthToken(state.accessToken);
  }, [state.accessToken]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;
      setAuthToken(accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken } });
      return { user, accessToken };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      await api.post('/auth/register', { name, email, password, role });
      return await login(email, password);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
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