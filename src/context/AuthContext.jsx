import { useState, useEffect, useRef } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/api';
import { AuthContext } from './AuthContextObject';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false); // Prevent multiple checks

  useEffect(() => {
    // Only check auth once on mount
    if (checkedRef.current) return;
    checkedRef.current = true;

    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch {
        // console.log('Not authenticated');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []); // Empty dependency array = run once only

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;
    
    // Store in memory only (NOT localStorage)
    setAccessToken(accessToken);
    setUser(user);
    
    return user;
  };

  const register = async (name, email, password, role = 'agent') => {
    const response = await api.post('/auth/register', { 
      name, 
      email, 
      password, 
      role 
    });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
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
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
