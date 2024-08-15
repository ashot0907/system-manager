import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './Terminal.css'; // Import the CSS file for styling

const Terminal = ({ onClose, onCollapse, onExpand, isFullscreen, command: initialCommand, output: initialOutput, updateState }) => {
  const [command, setCommand] = useState(initialCommand);
  const [output, setOutput] = useState(initialOutput);

  const handleCommandSubmit = async () => {
    if (command.trim() === 'clear') {
      setOutput('');
      setCommand('');
      updateState('', '');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/execute', { command });
      const newOutput = `${output}\n${command}\n${response.data.output}`;
      setOutput(newOutput);
      updateState('', newOutput);
      setCommand(''); // Clear the command input in the UI
    } catch (error) {
      const newOutput = `${output}\nError: ${error.message}`;
      setOutput(newOutput);
      updateState(command, newOutput);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommandSubmit();
    }
  };

  useEffect(() => {
    updateState(command, output);
  }, [command, output, updateState]);

  return (
    <Draggable handle=".terminal-header">
      <div className={isFullscreen ? 'fullscreen' : ''}>
        <ResizableBox
          width={isFullscreen ? window.innerWidth : 600}
          height={isFullscreen ? window.innerHeight : 400}
          minConstraints={[300, 200]}
          maxConstraints={isFullscreen ? [window.innerWidth, window.innerHeight] : [1200, 800]}
          className="terminal-resizable"
        >
          <div className="terminal">
            <div className="terminal-header">
              <button className="btn red" onClick={onClose}></button>
              <button className="btn yellow" onClick={onCollapse}></button>
              <button className="btn green" onClick={onExpand}></button>
            </div>
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
      </div>
    </Draggable>
  );
};

export default Terminal;
