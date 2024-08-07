import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography } from '@mui/material';
import AppTable from './AppTable';
import SystemCharts from './SystemCharts';
import TotalUsageDonuts from './TotalUsageDonuts';
import CpuCoresStream from './CpuCoresStream';
import './App.css';

const App = () => {
  const [systemInfo, setSystemInfo] = useState({
    cpuModel: '',
    gpuModel: '',
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/system')
      .then(response => {
        setSystemInfo({
          cpuModel: response.data.cpuModel,
          gpuModel: response.data.gpuModel,
        });
      })
      .catch(error => console.error('Error fetching system info:', error));
  }, []);

  return (
    <div id="main">
      <Container>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
          <Typography variant="h6" component="h2">
            CPU: {systemInfo.cpuModel}
          </Typography>
          <Typography variant="h6" component="h2">
            GPU: {systemInfo.gpuModel}
          </Typography>
        </Paper>
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
            <TotalUsageDonuts />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default App;
