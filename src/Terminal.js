import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './Terminal.css';

const Terminal = ({ onClose, onCollapse, onExpand, isFullscreen }) => {
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [history, setHistory] = useState([]); // История команд
    const [historyIndex, setHistoryIndex] = useState(-1); // Индекс истории для навигации
    const terminalEndRef = useRef(null); // Ссылка на конец терминала
    const ws = useRef(null); // WebSocket

    // Подключение к WebSocket
    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:5000/ws-terminal');

        ws.current.onmessage = (event) => {
            setOutput((prevOutput) => prevOutput + event.data);  // Добавляем вывод команды
        };

        return () => {
            ws.current.close();
        };
    }, []);

    // Прокрутка к концу вывода при изменении
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [output]);

    // Отправка команды на сервер
    const handleCommandSubmit = () => {
        if (command.trim() === '') return;

        const newHistory = [...history, command];
        setHistory(newHistory);
        setHistoryIndex(-1); // Сброс индекса истории

        if (command.trim() === 'clear') {
            setOutput('');
            setCommand('');
            return;
        }

        // Отправляем команду через WebSocket
        ws.current.send(`${command}\n`);
        setOutput((prevOutput) => prevOutput + `webos@root:~$ ${command}\n`);
        setCommand('');
    };

    // Обработка клавиш для управления вводом и навигации по истории команд
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

    const handleExpand = () => {
        onExpand();
        setPosition({ x: 0, y: 0 });
    };

    const onDrag = (e, data) => {
        setPosition({ x: data.x, y: data.y });
    };

    return (
        <Draggable
            handle=".terminal-header"
            position={isFullscreen ? { x: 0, y: 0 } : position}
            onDrag={onDrag}
            disabled={isFullscreen}
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
                            <div ref={terminalEndRef}></div> {/* Прокрутка до сюда */}
                        </pre>
                        <div className="terminal-input">
                            <span className="prompt">webos@root:~$ </span>
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                onKeyDown={handleKeyPress}
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
