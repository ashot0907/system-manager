import React, { useState } from 'react';
import axios from 'axios';

const Dropbox = () => {
    const [files, setFiles] = useState([]);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(droppedFiles);
        uploadFiles(droppedFiles);
    };

    const uploadFiles = async (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await axios.post('http://localhost:5005/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data.message);
        } catch (error) {
            console.error('Error uploading files:', error);
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
