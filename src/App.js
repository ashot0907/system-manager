import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskManager from './TaskManager';
import FileSystem from './FileSystem';
import Terminal from './Terminal';
import SystemInfo from './SystemInfo';
import LoginPage from './LoginPage';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import terminalImg from './assets/terminal.png';
import monitorResourcesImg from './assets/servermanagement.png';
import serverManagementImg from './assets/monitorresorses.png';
import InfoIcon from './assets/infoIcon.png';
import DropboxImg from './assets/Dropbox.png';
import TopBar from './TopBar';
import './App.css';
import Dropbox from './Dropbox';

// Theme for the application
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

// Main application content with routing and protected components
const AppContent = () => {
  const { isAuthenticated } = useAuth(); // Get authentication status
  const [terminals, setTerminals] = useState([]);
  const [nextTerminalId, setNextTerminalId] = useState(1);
  const [systemInfo, setSystemInfo] = useState({ isOpen: false, isFullscreen: false, isMinimized: false });
  const [isDropboxVisible, setDropboxVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated and trying to access any other route
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location, navigate]);

  // Ensure that only the login page is visible to unauthorized users
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  // Function to add a terminal
  const addTerminal = () => {
    setTerminals((prevTerminals) => [
      ...prevTerminals,
      { id: nextTerminalId, isFullscreen: false, isMinimized: false, output: '', command: '' },
    ]);
    setNextTerminalId(nextTerminalId + 1);
  };

  // Function to close a terminal
  const closeTerminal = (id) => {
    setTerminals((prevTerminals) => prevTerminals.filter((terminal) => terminal.id !== id));
  };

  // Minimize a terminal
  const minimizeTerminal = (id) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, isMinimized: true } : terminal
      )
    );
  };

  // Restore a terminal from minimized state
  const restoreTerminal = (id) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, isMinimized: false } : terminal
      )
    );
  };

  // Toggle fullscreen mode for a terminal
  const toggleFullscreen = (id) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, isFullscreen: !terminal.isFullscreen } : terminal
      )
    );
  };

  // Update terminal state
  const updateTerminalState = (id, command, output) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, command, output } : terminal
      )
    );
  };

  // Open system info panel
  const openSystemInfo = () => {
    setSystemInfo({ ...systemInfo, isOpen: true });
  };

  // Close system info panel
  const closeSystemInfo = () => {
    setSystemInfo({ isOpen: false, isFullscreen: false, isMinimized: false });
  };

  // Minimize system info
  const minimizeSystemInfo = () => {
    setSystemInfo({ ...systemInfo, isMinimized: true });
  };

  // Restore minimized system info
  const restoreSystemInfo = () => {
    setSystemInfo({ ...systemInfo, isMinimized: false });
  };

  // Toggle fullscreen for system info
  const toggleSystemInfoFullscreen = () => {
    setSystemInfo({ ...systemInfo, isFullscreen: !systemInfo.isFullscreen });
  };

  // Filter minimized terminals
  const minimizedTerminals = terminals.filter((t) => t.isMinimized);

  // Toggle Dropbox visibility
  const toggleDropboxVisibility = () => {
    setDropboxVisible((prevVisible) => !prevVisible);
  };

  return (
    <div id="main">
      {isAuthenticated && location.pathname !== '/login' && <TopBar />} {/* Only render TopBar if authenticated */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Protected routes that require authentication */}
        <Route path="/file-system" element={<ProtectedRoute element={<FileSystem />} />} />
        <Route path="/task-manager" element={<ProtectedRoute element={<TaskManager />} />} />
      </Routes>
      {/* Render Navbar and other components only when authenticated */}
      {isAuthenticated && location.pathname !== '/login' && (
        <>
          <Navbar
            onTerminalClick={addTerminal}
            onSystemInfoClick={openSystemInfo}
            onDropboxClick={toggleDropboxVisibility}
            minimizedTerminals={minimizedTerminals}
            restoreTerminal={restoreTerminal}
          />
          {/* Render terminals */}
          {terminals.map((terminal) =>
            !terminal.isMinimized ? (
              <div
                key={terminal.id}
                className={terminal.isFullscreen ? 'terminal-overlay fullscreen' : 'terminal-overlay'}
              >
                <Terminal
                  onClose={() => closeTerminal(terminal.id)}
                  onCollapse={() => minimizeTerminal(terminal.id)}
                  onExpand={() => toggleFullscreen(terminal.id)}
                  isFullscreen={terminal.isFullscreen}
                  command={terminal.command}
                  output={terminal.output}
                  updateState={(command, output) => updateTerminalState(terminal.id, command, output)}
                />
              </div>
            ) : null
          )}
          {/* Render system info if it's open */}
          {!systemInfo.isMinimized && systemInfo.isOpen && (
            <div className={systemInfo.isFullscreen ? 'system-info-overlay fullscreen' : 'system-info-overlay'}>
              <SystemInfo
                onClose={closeSystemInfo}
                onCollapse={minimizeSystemInfo}
                onExpand={toggleSystemInfoFullscreen}
                isFullscreen={systemInfo.isFullscreen}
              />
            </div>
          )}
          {/* Render Dropbox if visible */}
          {isDropboxVisible && location.pathname !== '/task-manager' &&  <div className="dropbox-container">
        <Dropbox />
    </div>}
        </>
      )}
    </div>
  );
};

// Navbar component for navigating between sections
const Navbar = ({ onTerminalClick, onSystemInfoClick, onDropboxClick, minimizedTerminals, restoreTerminal }) => {
  const navigate = useNavigate();

  return (
    <div className="dock">
      <button id="btn" onClick={() => navigate('/file-system')}>
        <img src={monitorResourcesImg} alt="File System" />
      </button>
      <button id="btn" onClick={() => navigate('/task-manager')}>
        <img src={serverManagementImg} alt="Task Manager" />
      </button>
      <button id="btn" onClick={onTerminalClick}>
        <img src={terminalImg} alt="New Terminal" />
      </button>
      <button id="btn" onClick={onSystemInfoClick}>
        <img src={InfoIcon} alt="System Info" />
      </button>
      <button id="btn" onClick={onDropboxClick}>
        <img src={DropboxImg} alt="Toggle Dropbox" />
      </button>
      {/* Render minimized terminals */}
      {minimizedTerminals.length > 0 && <hr className="dock-divider" />}
      {minimizedTerminals.map((terminal) => (
        <button key={terminal.id} id="btn" onClick={() => restoreTerminal(terminal.id)}>
          <img src={terminalImg} alt={`Terminal ${terminal.id}`} />
        </button>
      ))}
    </div>
  );
};

// Main App component with routing and context
const App = () => (
  <ThemeProvider theme={theme}>
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  </ThemeProvider>
);

export default App;
