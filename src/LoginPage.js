import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button, TextField, Typography, Container, Paper, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
  },
});

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      navigate('/file-system');
    } else {
      setError('Authentication failed');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="xs">
        <Paper elevation={6}>
          <Box p={3}>
            <form onSubmit={handleSubmit}>
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
                <Button type="submit" variant="contained" color="primary" fullWidth>
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
