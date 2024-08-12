import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import './FileSystem.css';

function FileSystem() {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [contextMenu, setContextMenu] = useState(null);
    const [desktopMenu, setDesktopMenu] = useState(null);

    useEffect(() => {
        if (!selectedFile) {
            fetch(`http://158.160.116.57:5005/files?path=${encodeURIComponent(currentPath)}`)
                .then(response => response.json())
                .then(data => setFiles(data))
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
        fetch(`http://158.160.116.57:5005/files/content?path=${encodeURIComponent(file.path)}`)
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
        fetch(`http://158.160.116.57:5005/files/save`, {
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

    const handleContextMenu = (event, file) => {
        event.preventDefault();
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            file,
        });
        setDesktopMenu(null);
    };

    const handleDesktopContextMenu = (event) => {
        event.preventDefault();
        setDesktopMenu({
            x: event.clientX,
            y: event.clientY,
        });
        setContextMenu(null);
    };

    const handleDelete = () => {
        if (contextMenu && contextMenu.file) {
            fetch(`http://158.160.116.57:5005/files/delete`, {
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
            fetch(`http://158.160.116.57:5005/files/rename`, {
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
            fetch(`http://158.160.116.57:5005/files/create-folder`, {
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
            fetch(`http://158.160.116.57:5005/files/create-text-file`, {
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

    return (
        <div className="desktop" onContextMenu={handleDesktopContextMenu}>
            <div className="pwd-display" style={{position: 'absolute', top: '10px', left: '20px'}}>{currentPath}</div>

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
                        <div className="file-icon" onClick={handleGoBack} onContextMenu={(e) => handleContextMenu(e, null)}>
                            <img src="/imgs/gobackdir.jpg" alt="folder icon" />
                            <p>..</p>
                        </div>
                    )}
                    {files.map((file, index) => (
                        <div key={index} className="file-icon" onClick={() => file.isDirectory ? handleDirectoryClick(file.path) : handleFileClick(file)} onContextMenu={(e) => handleContextMenu(e, file)}>
                            <img src={file.isDirectory ? "/imgs/folder.jpg" : "/imgs/file.png"} alt={file.isDirectory ? "folder icon" : "file icon"} />
                            <p>{file.name}</p>
                        </div>
                    ))}
                </>
            )}

            {contextMenu && (
                <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={handleDelete}>Delete</button>
                    <button onClick={handleRename}>Rename</button>
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
