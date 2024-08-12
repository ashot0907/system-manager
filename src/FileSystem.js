import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import './FileSystem.css';

function FileSystem() {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');

    useEffect(() => {
        if (!selectedFile) {
            fetch(`http://localhost:5000/files?path=${encodeURIComponent(currentPath)}`)
                .then(response => response.json())
                .then(data => setFiles(data))
                .catch(error => console.error('Error fetching files:', error));
        }
    }, [currentPath, selectedFile]);

    const handleDirectoryClick = (path) => {
        setCurrentPath(path); // Navigate to the clicked directory
    };

    const handleGoBack = () => {
        const newPath = currentPath.split('/').slice(0, -1).join('/') || '/'; // Go up one level
        setCurrentPath(newPath);
    };

    const handleFileClick = (file) => {
        fetch(`http://localhost:5000/files/content?path=${encodeURIComponent(file.path)}`)
            .then(response => response.text())
            .then(data => {
                setSelectedFile(file);
                setFileContent(data);
            })
            .catch(error => console.error('Error fetching file content:', error));
    };

    const handleSave = () => {
        fetch(`http://localhost:5000/files/save`, {
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

    return (
        <div className="desktop">
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
                        language={selectedFile.name.split('.').pop()} // Auto-detect language based on file extension
                        value={fileContent}
                        onChange={(value) => setFileContent(value)}
                        theme="vs-dark" // Dark theme for the editor
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false }, // Disable minimap for a cleaner look
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                        }}
                    />
                </div>
            ) : (
                <>
                    {currentPath !== '/' && (
                        <div className="file-icon" onClick={handleGoBack}>
                            <img src="/imgs/folder.jpg" alt="folder icon" />
                            <p>..</p>
                        </div>
                    )}
                    {files.map((file, index) => (
                        <div key={index} className="file-icon" onClick={() => file.isDirectory ? handleDirectoryClick(file.path) : handleFileClick(file)}>
                            <img src={file.isDirectory ? "/imgs/folder.jpg" : "/imgs/file.png"} alt={file.isDirectory ? "folder icon" : "file icon"} />
                            <p>{file.name}</p>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default FileSystem;
