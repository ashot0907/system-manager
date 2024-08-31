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

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [terminals, setTerminals] = useState([]);
  const [nextTerminalId, setNextTerminalId] = useState(1);
  const [systemInfo, setSystemInfo] = useState({ isOpen: false, isFullscreen: false, isMinimized: false });
  const [isDropboxVisible, setDropboxVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location, navigate]);

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  const addTerminal = () => {
    setTerminals((prevTerminals) => [
      ...prevTerminals,
      { id: nextTerminalId, isFullscreen: false, isMinimized: false, output: '', command: '' },
    ]);
    setNextTerminalId(nextTerminalId + 1);
  };

  const closeTerminal = (id) => {
    setTerminals((prevTerminals) => prevTerminals.filter((terminal) => terminal.id !== id));
  };

  const minimizeTerminal = (id) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, isMinimized: true } : terminal
      )
    );
  };

  const restoreTerminal = (id) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, isMinimized: false } : terminal
      )
    );
  };

  const toggleFullscreen = (id) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, isFullscreen: !terminal.isFullscreen } : terminal
      )
    );
  };

  const updateTerminalState = (id, command, output) => {
    setTerminals((prevTerminals) =>
      prevTerminals.map((terminal) =>
        terminal.id === id ? { ...terminal, command, output } : terminal
      )
    );
  };

  const openSystemInfo = () => {
    setSystemInfo({ ...systemInfo, isOpen: true });
  };

  const closeSystemInfo = () => {
    setSystemInfo({ isOpen: false, isFullscreen: false, isMinimized: false });
  };

  const minimizeSystemInfo = () => {
    setSystemInfo({ ...systemInfo, isMinimized: true });
  };

  const restoreSystemInfo = () => {
    setSystemInfo({ ...systemInfo, isMinimized: false });
  };

  const toggleSystemInfoFullscreen = () => {
    setSystemInfo({ ...systemInfo, isFullscreen: !systemInfo.isFullscreen });
  };

  const minimizedTerminals = terminals.filter((t) => t.isMinimized);

  const toggleDropboxVisibility = () => {
    setDropboxVisible((prevVisible) => !prevVisible);
  };

  return (
    <div id="main">
      {isAuthenticated && location.pathname !== '/login' && <TopBar />} {/* Only render TopBar if authenticated */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/file-system" element={<ProtectedRoute element={<FileSystem />} />} />
        <Route path="/task-manager" element={<ProtectedRoute element={<TaskManager />} />} />
      </Routes>
      {isAuthenticated && location.pathname !== '/login' && (
        <>
          <Navbar
            onTerminalClick={addTerminal}
            onSystemInfoClick={openSystemInfo}
            onDropboxClick={toggleDropboxVisibility}
            minimizedTerminals={minimizedTerminals}
            restoreTerminal={restoreTerminal}
          />
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
          {isDropboxVisible && location.pathname !== '/task-manager' && <Dropbox />}
        </>
      )}
    </div>
  );
};

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
      {minimizedTerminals.length > 0 && <hr className="dock-divider" />}
      {minimizedTerminals.map((terminal) => (
        <button key={terminal.id} id="btn" onClick={() => restoreTerminal(terminal.id)}>
          <img src={terminalImg} alt={`Terminal ${terminal.id}`} />
        </button>
      ))}
    </div>
  );
};

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
