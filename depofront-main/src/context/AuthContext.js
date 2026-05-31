import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { username, password } = JSON.parse(auth);
      // Verify credentials by fetching current user
      authAPI.getCurrentUser()
        .then((response) => {
          setUser({ 
            username: response.data.username || response.data.name || username,
            email: response.data.email 
          });
        })
        .catch(() => {
          // Invalid credentials, clear storage
          localStorage.removeItem('auth');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (username, password) => {
    // Store credentials for HTTP Basic Auth
    const auth = { username, password };
    localStorage.setItem('auth', JSON.stringify(auth));
    
    // Verify login by fetching current user
    return authAPI.getCurrentUser()
      .then((response) => {
        setUser({ 
          username: response.data.username || response.data.name || username,
          email: response.data.email 
        });
        return { success: true };
      })
      .catch((error) => {
        localStorage.removeItem('auth');
        return { 
          success: false, 
          error: error.response?.data?.message || 'Invalid credentials' 
        };
      });
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  const register = (data) => {
    return authAPI.register(data)
      .then(() => {
        // Auto-login after registration
        return login(data.username, data.password);
      })
      .catch((error) => {
        return { 
          success: false, 
          error: error.response?.data || 'Registration failed' 
        };
      });
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

