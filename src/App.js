import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AppTable from './AppTable';
import SystemCharts from './SystemCharts';
import terminalImg from './assets/terminal.png';
import serverManagementImg from './assets/servermanagement.png';
import monitorResourcesImg from './assets/monitorresorses.png';
import TotalUsageDonuts from './TotalUsageDonuts';
import CpuCoresStream from './CpuCoresStream';
import FileSystem from './FileSystem';
import Terminal from './Terminal';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import infoIcon from './assets/infoIcon.png'

// Minimal theme setup to avoid undefined properties
const theme = createTheme({
  palette: {
    primary: {
      main: '#fffff', // Default primary color
    },
    secondary: {
      main: '#fffff', // Default secondary color
    },
    background: {
      default: '#fffff', // Default background color
    },
  },
});

const App = () => {
  const [systemInfo, setSystemInfo] = useState({
    cpuModel: '',
    gpuModel: '',
    disks: [],
    memory: { total: '', used: '', free: '' },
  });
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/system')
      .then(response => {
        setSystemInfo({
          cpuModel: response.data.cpuModel,
          gpuModel: response.data.gpuModel,
          disks: response.data.disks || [],
          memory: response.data.memory,
        });
      })
      .catch(error => console.error('Error fetching system info:', error));
  }, []);

  const handleShowSystemInfo = () => {
    setShowSystemInfo(true);
  };

  const handleCloseSystemInfo = () => {
    setShowSystemInfo(false);
  };

  const handleToggleTerminal = () => {
    setShowTerminal(prevState => !prevState);
  };

  const handleToggleDashboard = () => {
    setShowDashboard(prevState => !prevState);
  };

  return (
    <ThemeProvider theme={theme}>
      <div id="main">
        <Container>
          <Button   id='btn' onClick={handleShowSystemInfo} style={{ marginBottom: '20px', marginRight: '10px' }}>
          <img 
          src={infoIcon} 
          alt={'System Info'} 
          style={{ width: '100px', height: '100px' }} 
        />
          </Button>
          <Button 
           id='btn'
        onClick={handleToggleTerminal} 
        style={{ marginBottom: '20px', marginRight: '10px' }}
      >
        <img 
          src={showTerminal ? terminalImg : terminalImg} 
          alt={showTerminal ? 'Hide Terminal' : 'Open Terminal'} 
          style={{ width: '100px', height: '100px' }} 
        />
      </Button>
      <Button 
        id='btn'
        onClick={handleToggleDashboard} 
        style={{ marginBottom: '20px', marginRight: '10px' }}
      >
        <img 
          src={showDashboard ? serverManagementImg : monitorResourcesImg} 
          alt={showDashboard ? 'Server Management' : 'Show Monitor Resources'} 
          style={{ width: '100px', height: '100px' }} 
        />
      </Button>
      
          
          {showSystemInfo && (
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px', position: 'relative' }}>
              <IconButton
                onClick={handleCloseSystemInfo}
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h4" component="h1" gutterBottom>
                System Information
              </Typography>
              <Typography variant="h6" component="h2">
                CPU: {systemInfo.cpuModel}
              </Typography>
              <Typography variant="h6" component="h2">
                GPU: {systemInfo.gpuModel}
              </Typography>
              {systemInfo.disks.length > 0 ? (
                systemInfo.disks.map((disk, index) => (
                  <div key={index}>
                    <Typography variant="h6" component="h2">
                      Disk: {disk.fs}
                    </Typography>
                    <Typography variant="h6" component="h2">
                      {disk.free} GB free from {disk.size} GB
                    </Typography>
                  </div>
                ))
              ) : (
                <Typography variant="h6" component="h2">
                  No disk information available.
                </Typography>
              )}
            </Paper>
          )}
          
          {showTerminal && (
            <div className="terminal-overlay">
              <Terminal />
            </div>
          )}
        </Container>
        
        <div className="dashboard">
          {showDashboard ? (
            <>
              <div className="card">
                <AppTable />
              </div>
              <div className="card">
                <CpuCoresStream />
              </div>
              <div className="card">
                <SystemCharts />
              </div>
              <div className="card">
                <TotalUsageDonuts memory={systemInfo.memory} />
              </div>
            </>
          ) : (
            <FileSystem />
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
