import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Menu, MenuItem, ThemeProvider, createTheme } from '@mui/material';
import './FileSystem.css';

// Create a dark theme with smaller font size for the menus
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize: '0.85rem', // Smaller font size
                    padding: '6px 12px', // Smaller padding
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#333', // Dark background for menu
                    color: '#fff', // Light text
                },
            },
        },
    },
});

function FileSystem() {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState(localStorage.getItem('currentPath') || '/'); // Preserve path
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [contextMenu, setContextMenu] = useState(null);
    const [hoveredFile, setHoveredFile] = useState(null);
    const [desktopMenu, setDesktopMenu] = useState(null);
    
    // Establish WebSocket connection for live updates
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:5005'); // Update with your server's WebSocket endpoint

        ws.onmessage = (event) => {
            // On receiving a message, update the files
            const message = JSON.parse(event.data);
            if (message.action === 'update') {
                fetchFiles(currentPath);
            }
        };

        return () => {
            ws.close();
        };
    }, [currentPath]);

    useEffect(() => {
        if (!selectedFile) {
            fetchFiles(currentPath);
        }
    }, [currentPath, selectedFile]);

    const fetchFiles = (path) => {
        fetch(`http://localhost:5005/files?path=${encodeURIComponent(path)}`)
            .then(response => response.json())
            .then(data => setFiles(data))
            .catch(error => console.error('Error fetching files:', error));
    };

    const handleDirectoryClick = (path) => {
        setCurrentPath(path);
        localStorage.setItem('currentPath', path); // Save path to localStorage
        setContextMenu(null);
        setDesktopMenu(null);
    };

    const handleGoBack = () => {
        const newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        setCurrentPath(newPath);
        localStorage.setItem('currentPath', newPath); // Save path to localStorage
        setContextMenu(null);
        setDesktopMenu(null);
    };

    const handleFileClick = (file) => {
        fetch(`http://localhost:5005/files/content?path=${encodeURIComponent(file.path)}`)
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
        fetch(`http://localhost:5005/files/save`, {
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
            fetch(`http://localhost:5005/files/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: contextMenu.file.path }),
            })
                .then(() => {
                    setContextMenu(null);
                    fetchFiles(currentPath); // Refresh files
                })
                .catch(error => console.error('Error deleting file:', error));
        }
    };

    const handleRename = () => {
        const newName = prompt('Enter the new name:', contextMenu.file.name);
        if (newName) {
            fetch(`http://localhost:5005/files/rename`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: contextMenu.file.path, newName }),
            })
                .then(() => {
                    setContextMenu(null);
                    fetchFiles(currentPath); // Refresh files
                })
                .catch(error => console.error('Error renaming file:', error));
        }
    };

    const handleCreateFolder = () => {
        const folderName = prompt('Enter the folder name:');
        if (folderName) {
            fetch(`http://localhost:5005/files/create-folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: currentPath, folderName }),
            })
                .then(() => {
                    setDesktopMenu(null);
                    fetchFiles(currentPath); // Refresh files
                })
                .catch(error => console.error('Error creating folder:', error));
        }
    };

    const handleCreateTextFile = () => {
        const fileName = prompt('Enter the file name (with .txt extension):');
        if (fileName) {
            fetch(`http://localhost:5005/files/create-text-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: currentPath, fileName }),
            })
                .then(() => {
                    setDesktopMenu(null);
                    fetchFiles(currentPath); // Refresh files
                })
                .catch(error => console.error('Error creating text file:', error));
        }
    };

    const handleUnzip = () => {
        if (contextMenu && contextMenu.file) {
            fetch(`http://localhost:5005/files/unzip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: contextMenu.file.path }),
            })
                .then(() => {
                    setContextMenu(null);
                    fetchFiles(currentPath); // Refresh files
                })
                .catch(error => console.error('Error unzipping file:', error));
        }
    };

    const handleDownload = () => {
        if (contextMenu && contextMenu.file) {
            const downloadLink = document.createElement('a');
            downloadLink.href = `http://localhost:5005/files/download?path=${encodeURIComponent(contextMenu.file.path)}`;
            downloadLink.download = contextMenu.file.name;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            setContextMenu(null);
        }
    };

    const handleCloseMenu = () => {
        setContextMenu(null);
        setDesktopMenu(null);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="desktop" onContextMenu={handleContextMenu} onClick={handleCloseMenu}>
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
                        {currentPath !== '/' && (
                            <div className="file-icon" onClick={handleGoBack} onMouseEnter={() => handleMouseEnter(null)} onMouseLeave={handleMouseLeave}>
                                <img src="/imgs/gobackdir.png" alt="folder icon" />
                                <p>..</p>
                            </div>
                        )}
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="file-icon"
                                onClick={() => file.isDirectory ? handleDirectoryClick(file.path) : handleFileClick(file)}
                                onMouseEnter={() => handleMouseEnter(file)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <img src={file.isDirectory ? "/imgs/folder.png" : "/imgs/file.png"} alt={file.isDirectory ? "folder icon" : "file icon"} />
                                <p>{file.name}</p>
                            </div>
                        ))}
                    </>
                )}

                {/* Right-click context menu for files */}
                <Menu
                    open={Boolean(contextMenu)}
                    onClose={handleCloseMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
                >
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                    <MenuItem onClick={handleRename}>Rename</MenuItem>
                    <MenuItem onClick={handleUnzip}>Unzip</MenuItem>
                    <MenuItem onClick={handleDownload}>Download</MenuItem>
                </Menu>

                {/* Right-click desktop menu */}
                <Menu
                    open={Boolean(desktopMenu)}
                    onClose={handleCloseMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={desktopMenu ? { top: desktopMenu.y, left: desktopMenu.x } : undefined}
                >
                    <MenuItem onClick={handleCreateFolder}>Create Folder</MenuItem>
                    <MenuItem onClick={handleCreateTextFile}>Create Text Document</MenuItem>
                </Menu>
            </div>
        </ThemeProvider>
    );
}

export default FileSystem;
