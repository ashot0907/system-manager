import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:5005/api/users')
      .then(response => setUsers(response.data.users))
      .catch(error => {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5005/api/authenticate', {
        username: selectedUser,
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
        <h2>Select User</h2>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">-- Select a user --</option>
          {users.map((user, index) => (
            <option key={index} value={user}>{user}</option>
          ))}
        </select>

        {selectedUser && (
          <div className="password-input">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={!selectedUser}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
