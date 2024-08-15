import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from '@mui/material';
import AppTable from './AppTable';
import SystemCharts from './SystemCharts';
import TotalUsageDonuts from './TotalUsageDonuts';
import CpuCoresStream from './CpuCoresStream';
import './TaskManager.css'; // Ensure this file exists or remove this line if unnecessary

const TaskManager = () => {
  const [systemInfo, setSystemInfo] = useState({
    cpuModel: '',
    gpuModel: '',
    disks: [],
    memory: { total: '', used: '', free: '' },
  });

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

  return (
    <Container style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
  );
};

export default TaskManager;
