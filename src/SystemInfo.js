import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import Draggable from 'react-draggable';
import './SystemInfo.css';

const SystemInfo = ({ onClose, onCollapse, onExpand, isFullscreen }) => {
  const [systemInfo, setSystemInfo] = useState({});
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Fetch system information
    fetch('http://localhost:5000/api/system-info')
      .then(response => response.json())
      .then(data => {
        setSystemInfo(data);
      })
      .catch(error => console.error('Error fetching system info:', error));
  }, []);

  const handleExpand = () => {
    onExpand();
    setPosition({ x: 0, y: 0 }); // Reset position when going fullscreen
  };

  const onDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      handle=".window-header"
      position={isFullscreen ? { x: 0, y: 0 } : position}
      onDrag={onDrag}
      disabled={isFullscreen} // Disable dragging in fullscreen mode
    >
      <div className={`system-info-window ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="window-header">
          <div className="window-buttons">
            <span className="window-button close" onClick={onClose}></span>
            <span className="window-button minimize" onClick={onClose}></span> {/* Yellow button now closes the window */}
            <span className="window-button maximize" onClick={handleExpand}></span>
          </div>
          <span className="window-title">System Info</span>
        </div>
        <TableContainer component={Paper} style={{ backgroundColor: '#333', marginTop: '8px' }}>
          <Table sx={{ minWidth: 650 }} aria-label="system info table">
            <TableHead>
              <TableRow>
                <TableCell style={{ color: '#fff' }}>Component</TableCell>
                <TableCell style={{ color: '#fff' }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{ color: '#fff' }}>CPU Model</TableCell>
                <TableCell style={{ color: '#fff' }}>{systemInfo.cpuModel}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ color: '#fff' }}>GPU Model</TableCell>
                <TableCell style={{ color: '#fff' }}>{systemInfo.gpuModel}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ color: '#fff' }}>Total Memory</TableCell>
                <TableCell style={{ color: '#fff' }}>{systemInfo.memory?.total} GB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ color: '#fff' }}>Used Memory</TableCell>
                <TableCell style={{ color: '#fff' }}>{systemInfo.memory?.used} GB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ color: '#fff' }}>Available Memory</TableCell>
                <TableCell style={{ color: '#fff' }}>{systemInfo.memory?.free} GB</TableCell>
              </TableRow>
              {systemInfo.disks?.map((disk, index) => (
                <TableRow key={index}>
                  <TableCell style={{ color: '#fff' }}>Disk {index + 1} ({disk.fs})</TableCell>
                  <TableCell style={{ color: '#fff' }}>Total: {disk.size} GB, Used: {disk.used} GB, Free: {disk.free} GB</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell style={{ color: '#fff' }}>IP Addresses</TableCell>
                <TableCell style={{ color: '#fff' }}>{systemInfo.ipAddresses?.join(', ')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ color: '#fff' }}>WiFi</TableCell>
                <TableCell style={{ color: '#fff' }}>
                  SSID: {systemInfo.wifi?.ssid || 'N/A'}, 
                  MAC: {systemInfo.wifi?.mac || 'N/A'}, 
                  Speed: {systemInfo.wifi?.speed !== 'N/A' ? `${systemInfo.wifi?.speed} Mbps` : 'N/A'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Draggable>
  );
};

export default SystemInfo;
