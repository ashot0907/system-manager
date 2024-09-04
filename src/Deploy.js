import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import './Deploy.css'; // Import the cool CSS

function Deploy({ onClose }) {
  const [files, setFiles] = useState(null);
  const [port, setPort] = useState(3000);
  const [logs, setLogs] = useState([]);
  const [servers, setServers] = useState([]);

  const handleFileSelection = (e) => {
    setFiles(e.target.files);
  };

  const handlePortChange = (e) => {
    setPort(e.target.value);
  };

  const handleSubmit = async () => {
    if (files && port) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      formData.append('port', port);

      try {
        const response = await fetch('http://localhost:5000/start-server', {
          method: 'POST',
          body: formData,
        });
        const result = await response.text();
        if (response.ok) {
          setLogs((prevLogs) => [...prevLogs, `Server started on port ${port}`]);
          fetchServers(); // Refresh server list
        } else if (result.includes('port is busy')) {
          setLogs((prevLogs) => [...prevLogs, `Port ${port} is busy, try another one`]);
        } else {
          setLogs((prevLogs) => [...prevLogs, 'Failed to start the server']);
        }
      } catch (error) {
        console.error('Error starting server:', error);
        setLogs((prevLogs) => [...prevLogs, 'Error starting server']);
      }
    } else {
      alert('Please select files and specify a port');
    }
  };

  const fetchServers = async () => {
    try {
      const response = await fetch('http://localhost:5000/servers');
      const data = await response.json();
      setServers(data);
    } catch (error) {
      console.error('Error fetching servers:', error);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  return (
    // <Draggable handle=".drag-handleD" defaultPosition={{ x: 100, y: 100 }}>
      <div className="draggable-containerD dark-themeD">
        <div className="mac-buttonsD">
          <button className="mac-buttonD redD" onClick={onClose}></button>
          <button className="mac-buttonD greyD"></button>
          <button className="mac-buttonD greyD"></button>
        </div>
        <div className="drag-handleD title-barD">
          <h2>Folder Upload and Server Control</h2>
        </div>
        <div className="upload-sectionD">
          <input type="file" multiple webkitdirectory="true" onChange={handleFileSelection} />
          <input
            type="number"
            value={port}
            onChange={handlePortChange}
            placeholder="Enter port number"
            min="1"
            max="65535"
            className="port-inputD"
          />
          <button onClick={handleSubmit} className="start-buttonD">Start Server</button>
        </div>
        <div className="logs-sectionD">
          <h3>Logs:</h3><span>[WebOS:] files are being save in the backend uploads directory</span>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
              // <li > {data}</li>
            ))}
          </ul>
        </div>
      </div>
    /* </Draggable> */
  );
}

export default Deploy;
