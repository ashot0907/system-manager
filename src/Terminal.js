import React, { useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './Terminal.css'; // Import the CSS file for styling

const Terminal = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');

  const handleCommandSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/execute', { command });
      setOutput(prevOutput => `${prevOutput}\n${command}\n${response.data.output}`);
      setCommand(''); // Clear the command input
    } catch (error) {
      setOutput(prevOutput => `${prevOutput}\nError: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommandSubmit();
    }
  };

  return (
    <Draggable>
      <ResizableBox width={600} height={400} minConstraints={[300, 200]} maxConstraints={[1200, 800]}>
        <div className="terminal">
          <pre className="terminal-output">{output}</pre>
          <div className="terminal-input">
            <span className="prompt">admin@admin:~$ </span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="command-input"
              autoFocus
            />
          </div>
        </div>
      </ResizableBox>
    </Draggable>
  );
};

export default Terminal;
