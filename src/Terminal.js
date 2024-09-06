import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './Terminal.css';

const Terminal = ({ onClose, onCollapse, onExpand, isFullscreen, command: initialCommand, output: initialOutput, updateState }) => {
  const [command, setCommand] = useState(initialCommand);
  const [output, setOutput] = useState(initialOutput);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]); // Store command history
  const [historyIndex, setHistoryIndex] = useState(-1); // For tracking current position in the history
  const terminalEndRef = useRef(null); // Reference to the bottom of the terminal

  // Scroll to the bottom whenever output changes
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  const handleCommandSubmit = async () => {
    if (command.trim() === '') return;

    // Store command in history
    const newHistory = [...history, command];
    setHistory(newHistory);
    setHistoryIndex(-1); // Reset history index after each new command

    if (command.trim() === 'clear') {
      setOutput('');
      setCommand('');
      updateState('', '');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/execute', { command });
      const newOutput = `${output}\n${command}\n${response.data}`;
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
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand(''); // Clear input when reaching the latest history
      }
    }
  };

  const handleExpand = () => {
    onExpand();
    setPosition({ x: 0, y: 0 }); // Reset position when going fullscreen
  };

  const onDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      handle=".terminal-header"
      position={isFullscreen ? { x: 0, y: 0 } : position}
      onDrag={onDrag}
      disabled={isFullscreen} // Disable dragging in fullscreen mode
    >
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
              <button className="btn green" onClick={handleExpand}></button>
            </div>
            <pre className="terminal-output">
              {output}
              <div ref={terminalEndRef}></div> {/* Scroll target */}
            </pre>
            <div className="terminal-input">
              <span className="prompt">webos@root:~$ </span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyPress} // Use onKeyDown for handling arrow keys
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
