import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AppTable from './AppTable';
import SystemCharts from './SystemCharts';
import TotalUsageDonuts from './TotalUsageDonuts';
import CpuCoresStream from './CpuCoresStream';
import './App.css';

const App = () => {
  const [systemInfo, setSystemInfo] = useState({
    cpuModel: '',
    gpuModel: '',
    disks: [],
    memory: { total: '', used: '', free: '' },
  });
  const [showSystemInfo, setShowSystemInfo] = useState(false);

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

  return (
    <div id="main">
      <Container>
        <Button variant="contained" color="primary" onClick={handleShowSystemInfo} style={{ marginBottom: '20px' }}>
          Show System Information
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
        <div className="dashboard">
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
        </div>
      </Container>
    </div>
  );
};

export default App;
