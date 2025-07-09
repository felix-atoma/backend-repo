import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configure axios to send cookies with requests
  axios.defaults.withCredentials = true;

  const login = async (username, password) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/login`, 
        { username, password }
      );
      setUser(data.user);
      navigate('chat');
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const register = async (username, password) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/register`, 
        { username, password }
      );
      await login(username, password);
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/check`
      );
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);