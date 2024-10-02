import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TotalUsageDonuts = () => {
  const [totalCpuUsage, setTotalCpuUsage] = useState(0);
  const [totalGpuUsage, setTotalGpuUsage] = useState('N/A');
  const [totalMemUsage, setTotalMemUsage] = useState(0);
  const [memory, setMemory] = useState({ total: 0, used: 0, free: 0 });

  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000/api/system')
        .then(response => {
          setTotalCpuUsage(response.data.totalCpuUsage);
          setTotalGpuUsage(response.data.totalGpuUsage);
          setTotalMemUsage(response.data.totalMemUsage);
          setMemory(response.data.memory);
        })
        .catch(error => console.error(error));
    };

    // Fetch data immediately and then every 5 seconds
    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  if (!memory || memory.total === 0) {
    return <div>Loading...</div>; // or some other loading indicator
  }

  const cpuData = {
    labels: ['Used CPU %', 'Free CPU %'],
    datasets: [{
      data: [totalCpuUsage, 100 - totalCpuUsage],
      backgroundColor: ['rgb(205, 205, 205)', 'rgb(102, 107, 112)'],
      borderColor: "rgba(249, 105, 14)"
    }],
  };

  const gpuData = {
    labels: ['Used GPU %', 'Free GPU %'],
    datasets: [{
      data: totalGpuUsage !== 'N/A' ? [totalGpuUsage, 100 - totalGpuUsage] : [0, 100],
      backgroundColor: ['rgb(205, 205, 205)', 'rgb(102, 107, 112)'],
      borderColor: "rgba(249, 105, 14)"
    }],
  };

  const memoryData = {
    labels: ['Used Memory MB', 'Free Memory MB'],
    datasets: [{
      data: [memory.used / 1024 / 1024, memory.free / 1024 / 1024],
      backgroundColor: ['rgb(205, 205, 205)', 'rgb(102, 107, 112)'],
      borderColor: "rgba(249, 105, 14)"
    }],
  };

  return (
    <div id="donuts" className='bgP'>
      <div className="doughnut-chart">
        <h3>CPU Usage</h3>
        <Doughnut data={cpuData} width={250} height={250}/>
      </div>
      <div className="doughnut-chart">
        <h3>GPU Usage</h3>
        <Doughnut data={gpuData} width={250} height={250}/>
      </div>
      <div className="doughnut-chart">
        <h3>Memory Usage</h3>
        <Doughnut data={memoryData} width={250} height={250}/>
      </div>
    </div>
  );
};

export default TotalUsageDonuts;
