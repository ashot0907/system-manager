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

    const uploadFiles = async (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file, file.webkitRelativePath || file.name);
        });

        const pwd = document.querySelector('.pwd-display').textContent.trim();
        console.log('Uploading to path:', pwd);

        try {
            const response = await axios.post('http://0.0.0.0:5005/upload', formData, {
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
                color: '#555',
                cursor: 'pointer'
            }}
        >
            <p>Drop files or folders here to upload</p>
        </div>
    );
};

export default Dropbox;
