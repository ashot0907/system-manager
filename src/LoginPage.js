import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Default username
    const username = 'Web';

    try {
      const response = await axios.post('http://localhost:5000/api/authenticate', {
        username,
        password
      });

      if (response.data.success) {
        login(); // Set authentication state
        navigate('/file-system'); // Redirect after successful login
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Authentication failed');
      console.error('Authentication error:', err);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        <input
          type="text"
          value="Web" // Display default username, fixed value
          readOnly // Username is fixed
        />
        
        <div className="password-input">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
