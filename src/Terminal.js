import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './Terminal.css';

const Terminal = ({ onClose, onCollapse, onExpand, isFullscreen, command: initialCommand, output: initialOutput, updateState }) => {
  const [command, setCommand] = useState(initialCommand || '');
  const [output, setOutput] = useState(initialOutput || '');
  const [history, setHistory] = useState([]); // Сохраняем историю команд
  const [historyIndex, setHistoryIndex] = useState(-1); // Для навигации по истории команд
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ws = useRef(null); // WebSocket соединение

  // Устанавливаем соединение с WebSocket при монтировании компонента
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000/ws-terminal');

    ws.current.onmessage = (event) => {
      // Добавляем вывод с сервера в терминал
      setOutput((prevOutput) => prevOutput + event.data);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  // Отправляем команду на сервер
  const handleCommandSubmit = () => {
    if (command.trim() === '') return;

    // Сохраняем команду в истории
    const newHistory = [...history, command];
    setHistory(newHistory);
    setHistoryIndex(-1); // Сбрасываем индекс после каждой новой команды

    // Команда "clear" очищает терминал
    if (command.trim() === 'clear') {
      setOutput('');
      setCommand('');
      updateState('', ''); // Сохраняем обновлённое состояние
      return;
    }

    // Добавляем команду в вывод терминала
    setOutput((prevOutput) => `${prevOutput}webos@root:~$ ${command}\n`);

    // Отправляем команду на сервер через WebSocket
    ws.current.send(command + '\n');

    // Очищаем ввод команды
    setCommand('');
  };

  // Обработка клавиш для навигации по истории команд
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
        setCommand('');
      }
    }
  };

  // Функция, вызываемая при сворачивании окна
  const handleCollapse = () => {
    updateState(command, output); // Сохраняем текущее состояние команд и вывода при сворачивании
    onCollapse(); // Вызываем функцию сворачивания
  };

  const handleExpand = () => {
    onExpand();
    setPosition({ x: 0, y: 0 }); // Сбрасываем позицию при переходе в полноэкранный режим
  };

  const onDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      handle=".terminal-header"
      position={isFullscreen ? { x: 0, y: 0 } : position}
      onDrag={onDrag}
      disabled={isFullscreen} // Отключаем перетаскивание в полноэкранном режиме
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
              <button className="btn yellow" onClick={handleCollapse}></button>
              <button className="btn green" onClick={handleExpand}></button>
            </div>
            <pre className="terminal-output">
              {output}
            </pre>
            <div className="terminal-input">
              <span className="prompt">webos@root:~$ </span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyPress} // Обработка нажатий клавиш
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
