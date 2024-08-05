import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const TotalUsageDonuts = () => {
  const [totalCpuUsage, setTotalCpuUsage] = useState(0);
  const [totalGpuUsage, setTotalGpuUsage] = useState('N/A');
  const [totalMemUsage, setTotalMemUsage] = useState(0);
  const [memory, setMemory] = useState({ total: 0, used: 0, free: 0 });

  useEffect(() => {
    axios.get('http://localhost:5000/api/system')
      .then(response => {
        setTotalCpuUsage(response.data.totalCpuUsage);
        setTotalGpuUsage(response.data.totalGpuUsage);
        setTotalMemUsage(response.data.totalMemUsage);
        setMemory(response.data.memory);
      })
      .catch(error => console.error(error));
  }, []);

  if (!memory || memory.total === 0) {
    return <div>Loading...</div>; // or some other loading indicator
  }

  const cpuData = {
    labels: ['Used CPU %', 'Free CPU %'],
    datasets: [{
      data: [totalCpuUsage, 100 - totalCpuUsage],
      backgroundColor: ['#FF6384', '#36A2EB'],
    }],
  };

  const gpuData = {
    labels: ['Used GPU %', 'Free GPU %'],
    datasets: [{
      data: totalGpuUsage !== 'N/A' ? [totalGpuUsage, 100 - totalGpuUsage] : [0, 100],
      backgroundColor: ['#FF6384', '#36A2EB'],
    }],
  };

  const memoryData = {
    labels: ['Used Memory MB', 'Free Memory MB'],
    datasets: [{
      data: [memory.used / 1024 / 1024, memory.free / 1024 / 1024],
      backgroundColor: ['#FF6384', '#36A2EB'],
    }],
  };

  return (
    <div style={{ marginTop: '20px' }} id='donutes'>
      <div style={{ marginBottom: '20px' }}>
        <h3>CPU Usage</h3>
        <Doughnut data={cpuData} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h3>GPU Usage</h3>
        <Doughnut data={gpuData} />
      </div>
      <div>
        <h3>Memory Usage</h3>
        <Doughnut data={memoryData} />
      </div>
    </div>
  );
};

export default TotalUsageDonuts;
