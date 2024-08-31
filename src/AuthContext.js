import React, { createContext, useContext, useState } from 'react';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = async (password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/authenticate', { password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
      }
      return response.data.success;
    } catch (err) {
      console.error('Authentication error:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/'); // Redirect to login page
  };

  const isAuthenticated = async () => {
    if (!token) return false;

    try {
      const response = await axios.post('http://localhost:5000/api/verify-token', { token });
      return response.data.success;
    } catch (err) {
      console.error('Token verification error:', err);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
