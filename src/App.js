import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Container, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskManager from './TaskManager';
import FileSystem from './FileSystem';
import Terminal from './Terminal';
import terminalImg from './assets/terminal.png';
import serverManagementImg from './assets/servermanagement.png';
import monitorResourcesImg from './assets/monitorresorses.png';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
    },
  },
});

const App = () => {
  const [showTerminal, setShowTerminal] = useState(false);

  const toggleTerminal = () => {
    setShowTerminal((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div id="main">
          <Routes>
            <Route path="/file-system" element={<FileSystem />} />
            <Route path="/task-manager" element={<TaskManager />} />
          </Routes>
          <Navbar toggleTerminal={toggleTerminal} />
          {showTerminal && (
            <div className="terminal-overlay">
              <Terminal />
            </div>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
};

const Navbar = ({ toggleTerminal }) => {
  const navigate = useNavigate();

  return (
    <div className="dock">
      <Button id="btn" onClick={() => navigate('/file-system')}>
        <img src={monitorResourcesImg} alt="File System" />
      </Button>
      <Button id="btn" onClick={() => navigate('/task-manager')}>
        <img src={serverManagementImg} alt="Task Manager" />
      </Button>
      <Button id="btn" onClick={toggleTerminal}>
        <img src={terminalImg} alt="Terminal" />
      </Button>
    </div>
  );
};

export default App;
