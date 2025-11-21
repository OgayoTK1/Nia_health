/* eslint-disable react-refresh/only-export-components */
// Auth Context
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    console.debug('Auth init - storedUser present?', !!storedUser, 'token present?', !!token);

    if (storedUser && storedUser !== 'undefined' && token) {
      try {
        const parsed = JSON.parse(storedUser);
        console.debug('Auth init - parsed stored user:', parsed);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, userType = 'patient') => {
    let response;
    if (userType === 'patient') {
      response = await authAPI.loginPatient(email, password);
    } else {
      response = await authAPI.loginHealthWorker(email, password);
    }

    if (response.requiresOTP) {
      return { requiresOTP: true, email, userType };
    }

    if (response.data) {
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      setIsAuthenticated(true);
    }

    return response;
  };

  const verifyOTP = async (email, otp, userType) => {
    const response = await authAPI.verifyOTP(email, otp, userType);
    if (response.data) {
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      setIsAuthenticated(true);
    }
    return response;
  };

  const register = async (data) => {
    const response = await authAPI.registerPatient(data);
    return response;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const setAuthUser = (userData) => {
    console.debug('setAuthUser called with:', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    verifyOTP,
    setAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
