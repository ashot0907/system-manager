import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import './FileSystem.css';

function FileSystem() {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [contextMenu, setContextMenu] = useState(null);
    const [hoveredFile, setHoveredFile] = useState(null);
    const [desktopMenu, setDesktopMenu] = useState(null);

    useEffect(() => {
        if (!selectedFile) {
            fetch(`http://0.0.0.0:5005/files?path=${encodeURIComponent(currentPath)}`)
                .then(response => response.json())
                .then(data => {
                    // Add Go Back button as the first item
                    const goBackFolder = currentPath !== '/' ? {
                        name: '..',
                        isDirectory: true,
                        path: currentPath.split('/').slice(0, -1).join('/') || '/'
                    } : null;

                    const initialFiles = (goBackFolder ? [goBackFolder, ...data] : data).map((file, index) => ({
                        ...file,
                        position: {
                            x: (index % 5) * 120 + 20, // 120px horizontal gap
                            y: Math.floor(index / 5) * 120 + 20, // 120px vertical gap
                        }
                    }));
                    setFiles(initialFiles);
                })
                .catch(error => console.error('Error fetching files:', error));
        }
    }, [currentPath, selectedFile]);

    const handleDirectoryClick = (path) => {
        setCurrentPath(path);
        setContextMenu(null);
        setDesktopMenu(null);
    };

    const handleGoBack = () => {
        const newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        setCurrentPath(newPath);
        setContextMenu(null);
        setDesktopMenu(null);
    };

    const handleFileClick = (file) => {
        fetch(`http://0.0.0.0:5005/files/content?path=${encodeURIComponent(file.path)}`)
            .then(response => response.text())
            .then(data => {
                setSelectedFile(file);
                setFileContent(data);
            })
            .catch(error => console.error('Error fetching file content:', error));
        setContextMenu(null);
        setDesktopMenu(null);
    };

    const handleSave = () => {
        fetch(`http://0.0.0.0:5005/files/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: selectedFile.path,
                content: fileContent,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('File saved successfully!');
                } else {
                    alert('Failed to save file.');
                }
            })
            .catch(error => console.error('Error saving file:', error));
    };

    const handleContextMenu = (event) => {
        event.preventDefault();
        if (hoveredFile) {
            setContextMenu({
                x: event.clientX,
                y: event.clientY,
                file: hoveredFile,
            });
            setDesktopMenu(null);
        } else {
            setDesktopMenu({
                x: event.clientX,
                y: event.clientY,
            });
            setContextMenu(null);
        }
    };

    const handleMouseEnter = (file) => {
        setHoveredFile(file);
    };

    const handleMouseLeave = () => {
        setHoveredFile(null);
    };

    const handleDelete = () => {
        if (contextMenu && contextMenu.file) {
            fetch(`http://0.0.0.0:5005/files/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: contextMenu.file.path }),
            })
                .then(() => {
                    setContextMenu(null);
                    setCurrentPath(currentPath);
                })
                .catch(error => console.error('Error deleting file:', error));
        }
    };

    const handleRename = () => {
        const newName = prompt('Enter the new name:', contextMenu.file.name);
        if (newName) {
            fetch(`http://0.0.0.0:5005/files/rename`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: contextMenu.file.path, newName }),
            })
                .then(() => {
                    setContextMenu(null);
                    setCurrentPath(currentPath);
                })
                .catch(error => console.error('Error renaming file:', error));
        }
    };

    const handleCreateFolder = () => {
        const folderName = prompt('Enter the folder name:');
        if (folderName) {
            fetch(`http://0.0.0.0:5005/files/create-folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: currentPath, folderName }),
            })
                .then(() => {
                    setDesktopMenu(null);
                    setCurrentPath(currentPath);
                })
                .catch(error => console.error('Error creating folder:', error));
        }
    };

    const handleCreateTextFile = () => {
        const fileName = prompt('Enter the file name (with .txt extension):');
        if (fileName) {
            fetch(`http://0.0.0.0:5005/files/create-text-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: currentPath, fileName }),
            })
                .then(() => {
                    setDesktopMenu(null);
                    setCurrentPath(currentPath);
                })
                .catch(error => console.error('Error creating text file:', error));
        }
    };

    const handleUnzip = () => {
        if (contextMenu && contextMenu.file) {
            fetch(`http://0.0.0.0:5005/files/unzip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: contextMenu.file.path }),
            })
                .then(() => {
                    setContextMenu(null);
                    setCurrentPath(currentPath);
                })
                .catch(error => console.error('Error unzipping file:', error));
        }
    };

    const handleDownload = () => {
        if (contextMenu && contextMenu.file) {
            const downloadLink = document.createElement('a');
            downloadLink.href = `http://0.0.0.0:5005/files/download?path=${encodeURIComponent(contextMenu.file.path)}`;
            downloadLink.download = contextMenu.file.name;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            setContextMenu(null);
        }
    };

    const handleDragStart = (event, index) => {
        event.dataTransfer.setData('index', index);
    };

    const handleDrop = (event) => {
        const index = event.dataTransfer.getData('index');
        const newFiles = [...files];
        newFiles[index].position = {
            x: event.clientX - 30, // Center the icon at the mouse position
            y: event.clientY - 30,
        };
        setFiles(newFiles);
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // Necessary to allow a drop
    };

    return (
        <div className="desktop" onContextMenu={handleContextMenu} onDrop={handleDrop} onDragOver={handleDragOver}>
            <div className="pwd-display" style={{ position: 'absolute', top: '10px', left: '20px' }}>{currentPath}</div>

            {selectedFile ? (
                <div className="editor-container">
                    <div className="editor-header">
                        <h2>Editing: {selectedFile.name}</h2>
                        <div>
                            <button className="btn-save" onClick={handleSave}>💾 Save</button>
                            <button className="btn-close" onClick={() => setSelectedFile(null)}>❌ Close</button>
                        </div>
                    </div>
                    <Editor
                        height="85vh"
                        width="100%"
                        language={selectedFile.name.split('.').pop()}
                        value={fileContent}
                        onChange={(value) => setFileContent(value)}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                        }}
                    />
                </div>
            ) : (
                <>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="file-icon"
                            style={{
                                position: 'absolute',
                                left: `${file.position.x}px`,
                                top: `${file.position.y}px`,
                            }}
                            onClick={() => file.isDirectory ? handleDirectoryClick(file.path) : handleFileClick(file)}
                            draggable
                            onDragStart={(event) => handleDragStart(event, index)}
                            onMouseEnter={() => handleMouseEnter(file)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img src={file.isDirectory ? "/imgs/folder.png" : "/imgs/file.png"} alt={file.isDirectory ? "folder icon" : "file icon"} />
                            <p>{file.name}</p>
                        </div>
                    ))}
                </>
            )}

            {contextMenu && (
                <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={handleDelete}>Delete</button>
                    <button onClick={handleRename}>Rename</button>
                    <button onClick={handleUnzip}>Unzip</button>
                    <button onClick={handleDownload}>Download</button>
                </div>
            )}

            {desktopMenu && (
                <div className="context-menu" style={{ top: desktopMenu.y, left: desktopMenu.x }}>
                    <button onClick={handleCreateFolder}>Create Folder</button>
                    <button onClick={handleCreateTextFile}>Create Text Document</button>
                </div>
            )}
        </div>
    );
}

export default FileSystem;
