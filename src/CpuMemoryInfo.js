import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import OpacityIcon from '@mui/icons-material/Opacity';
import ThermostatIcon from '@mui/icons-material/Thermostat';

const CpuMemoryInfo = () => {
  const [cpuLoad, setCpuLoad] = useState('');
  const [cpuTemp, setCpuTemp] = useState('');
  const [memory, setMemory] = useState({ free: '', total: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/cpu-memory-info')
      .then(response => {
        setCpuLoad(response.data.cpuLoad);
        setCpuTemp(response.data.cpuTemp);
        setMemory(response.data.memory);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch CPU/memory info');
      });
  }, []);

  return (
    <Card elevation={3} style={{ marginTop: '20px' }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          CPU and Memory Info
        </Typography>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
              <MemoryIcon fontSize="large" style={{ marginRight: '10px' }} />
              <Typography variant="h6">
                CPU Load: {cpuLoad}%
              </Typography>
            </Grid>
            <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
              <ThermostatIcon fontSize="large" style={{ marginRight: '10px' }} />
              <Typography variant="h6">
                CPU Temp: {cpuTemp}°C
              </Typography>
            </Grid>
            <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
              <OpacityIcon fontSize="large" style={{ marginRight: '10px' }} />
              <Typography variant="h6">
                Memory: {memory.free} GB free from {memory.total} GB
              </Typography>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default CpuMemoryInfo;
