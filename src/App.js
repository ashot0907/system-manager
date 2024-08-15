import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
  const [terminals, setTerminals] = useState([]); // Array of terminal instances
  const [nextTerminalId, setNextTerminalId] = useState(1);

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

  const minimizedTerminals = terminals.filter((t) => t.isMinimized);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div id="main">
          <Routes>
            <Route path="/file-system" element={<FileSystem />} />
            <Route path="/task-manager" element={<TaskManager />} />
          </Routes>
          <Navbar
            onTerminalClick={addTerminal}
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
        </div>
      </Router>
    </ThemeProvider>
  );
};

const Navbar = ({ onTerminalClick, minimizedTerminals, restoreTerminal }) => {
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
      {minimizedTerminals.length > 0 && <hr className="dock-divider" />}
      {minimizedTerminals.map((terminal) => (
        <button key={terminal.id} id="btn" onClick={() => restoreTerminal(terminal.id)}>
          <img src={terminalImg} alt={`Terminal ${terminal.id}`} />
        </button>
      ))}
    </div>
  );
};

export default App;
