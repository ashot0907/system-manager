const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS
app.use(express.json()); // To parse JSON bodies

// Endpoint to get files and directories in a given path
app.get('/files', (req, res) => {
    const directoryPath = req.query.path ? req.query.path : '/'; // Start from root if no path is provided

    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).send(`Unable to scan directory: ${err.message}`);
        }

        const fileList = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            path: path.join(directoryPath, file.name),
        }));

        res.json(fileList);
    });
});

// Endpoint to get the content of a specific file
app.get('/files/content', (req, res) => {
    const filePath = req.query.path;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send(`Unable to read file: ${err.message}`);
        }

        res.send(data);
    });
});

// Endpoint to save the content of a specific file
app.post('/files/save', (req, res) => {
    const { path: filePath, content } = req.body;

    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send(`Unable to save file: ${err.message}`);
        }

        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
