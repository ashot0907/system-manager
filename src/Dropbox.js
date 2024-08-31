import React, { useState } from 'react';
import axios from 'axios';

const Dropbox = () => {
    const [files, setFiles] = useState([]);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.items);
        const fileArray = [];

        droppedFiles.forEach(item => {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                fileArray.push(file);
            }
        });

        setFiles(fileArray);
        uploadFiles(fileArray);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        uploadFiles(selectedFiles);
    };

    const uploadFiles = async (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file, file.webkitRelativePath || file.name);
        });

        const pwd = document.querySelector('.pwd-display').textContent.trim();
        console.log('Uploading to path:', pwd);

        try {
            const response = await axios.post('http://localhost:5005/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'directory-path': pwd, // Send the path to the backend
                }
            });
            console.log('Upload successful:', response.data.message);
        } catch (error) {
            console.error('Error uploading files:', error.message);
        }
    };

    return (
        <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
                border: '2px dashed #ccc',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center',
                color: 'white',
                cursor: 'pointer'
            }}
        >
            <button onClick={() => document.getElementById('fileInput').click()} style={{background:'none', color:'white'}}>
            <p>Drop files or folders here to upload or</p>
            <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="fileInput"
            />
            
                Choose Files
            </button>
        </div>
    );
};

export default Dropbox;
