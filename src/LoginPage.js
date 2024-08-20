import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Detect OS and set the input fields for Windows, Linux, or macOS
    const platform = window.navigator.platform.toLowerCase();
    
    // Check if the OS is macOS, Windows, or Linux and set logic accordingly
    if (platform.includes('mac')) {
      // For macOS, preset the credentials
      setUsername('WebOS');
      setPassword('Mac33');
      setIsEditable(false); // Disable editing for macOS users
    } else if (platform.includes('win') || platform.includes('linux')) {
      setIsEditable(true); // Enable input for username and password
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5005/api/authenticate', {
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
        <h2>{isEditable ? 'Enter Username' : 'Login'}</h2>
        
        {isEditable ? (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        ) : (
          <input
            type="text"
            value={username}
            readOnly // Disable input for macOS users
          />
        )}

        <div className="password-input">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEditable ? "Enter password" : ""}
            readOnly={!isEditable} // Disable password input for macOS
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={!username}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
