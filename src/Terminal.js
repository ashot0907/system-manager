import React, { useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');

  const handleCommandSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/execute', { command });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <Draggable>
      <ResizableBox width={600} height={400} minConstraints={[300, 200]} maxConstraints={[1200, 800]}>
        <div style={{ border: '1px solid black', padding: '10px', background: '#f4f4f4' }}>
          <h2>Terminal</h2>
          <textarea
            rows="4"
            cols="50"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
          />
          <button onClick={handleCommandSubmit}>Run Command</button>
          <pre>{output}</pre>
        </div>
      </ResizableBox>
    </Draggable>
  );
};

export default Terminal;
