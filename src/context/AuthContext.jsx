import { createContext, useState, useContext, useEffect } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { accessToken, user } = response.data;
    
    // Store in memory only (NOT localStorage)
    setAccessToken(accessToken);
    setUser(user);
    
    return user;
  };

  const register = async (name, email, password, role = 'agent') => {
    const response = await api.post('/api/auth/register', { 
      name, 
      email, 
      password, 
      role 
    });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};