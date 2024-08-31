import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button, TextField, Typography, Container, Paper, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './LoginPage.css';
import loginLogo from './assets/loginlogo.png'; // Importing the image

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = 'Web'; // Username is handled directly here

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
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="xs">
        <Paper elevation={6} className="login-container">
          <Box p={3}>
            <form onSubmit={handleSubmit}>
              <Box display="flex" justifyContent="center" mb={0}>
                <img src={loginLogo} alt="Login Logo" style={{ width:'300px', height: 'auto' }} />
              </Box>

        

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
              />

              {error && <Typography color="error" align="center">{error}</Typography>}

              <Box mt={2}>
                <Button id='btne'
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Login
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;
