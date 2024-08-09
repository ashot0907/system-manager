import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './SystemInfoComponent.css';

function SystemInfoComponent() {
  const [systemData, setSystemData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/system')
      .then(response => response.json())
      .then(data => setSystemData(data))
      .catch(error => console.error('Error fetching system data:', error));
  }, []);

  if (!systemData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="system-info">
      <div className="info-section">
        <h2>CPU: {systemData.cpuModel}</h2>
        <div className="circular-container">
          <div className="circular-progress">
            <CircularProgress variant="determinate" value={51} size={100} />
            <div className="label">TEMP<br/>{systemData.cpuTemp}°C</div>
          </div>
          <div className="circular-progress">
            <CircularProgress variant="determinate" value={Number(systemData.totalCpuUsage)} size={100} />
            <div className="label">LOAD<br/>{systemData.totalCpuUsage}%</div>
          </div>
        </div>
      </div>
      <div className="info-section">
        <h2>GPU: {systemData.gpuModel}</h2>
        <div className="circular-container">
          <div className="circular-progress">
            <CircularProgress variant="determinate" value={66} size={100} />
            <div className="label">TEMP<br/>{systemData.gpuTemp}°C</div>
          </div>
          <div className="circular-progress">
            <CircularProgress variant="determinate" value={Number(systemData.totalGpuUsage)} size={100} />
            <div className="label">LOAD<br/>{systemData.totalGpuUsage}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemInfoComponent;
