const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

let pam;
if (os.platform() === 'darwin' || os.platform() === 'linux') {
    pam = require('authenticate-pam');
}

// Login endpoint
app.get('/api/users', (req, res) => {
    if (os.platform() === 'darwin') {
        exec('dscl . list /Users UniqueID | awk \'$2 >= 500 { print $1 }\'', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error fetching users: ${stderr}`);
                return res.status(500).json({ error: 'Failed to fetch users' });
            }
            const users = stdout.split('\n').filter(user => user);
            res.json({ users });
        });
    } else {
        res.json({ users: [] });
    }
});

// Detect OS and handle authentication
app.post('/api/authenticate', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const platform = os.platform();

    if (platform === 'darwin') {
        pam.authenticate(username, password, (err) => {
            if (err) {
                console.error(`Authentication failed for ${username}:`, err);
                return res.status(401).json({ error: 'Authentication failed', details: err.message || err });
            }
            res.json({ success: true });
        });
    } else if (platform === 'linux') {
        if (username === 'WebOS' && password === 'Linux33') {
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    } else if (platform === 'win32') {
        if (username === 'WebOS' && password === 'Win33') {
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    } else {
        res.status(400).json({ error: 'Unsupported platform' });
    }
});

// Endpoint to get files and directories in a given path
app.get('/files', (req, res) => {
    const directoryPath = req.query.path ? req.query.path : '/';
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
            return res.status(500).send({ success: false });
        }
        res.json({ success: true });
    });
});

// Endpoint to create a new folder
app.post('/files/create-folder', (req, res) => {
    const { path: currentPath, folderName } = req.body;
    const folderPath = path.join(currentPath, folderName);
    fs.mkdir(folderPath, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return res.status(500).send({ success: false });
        }
        res.json({ success: true });
    });
});

// Endpoint to create a new text file
app.post('/files/create-text-file', (req, res) => {
    const { path: currentPath, fileName } = req.body;
    const filePath = path.join(currentPath, fileName);
    fs.writeFile(filePath, '', 'utf8', (err) => {
        if (err) {
            console.error('Error creating text file:', err);
            return res.status(500).send({ success: false });
        }
        res.json({ success: true });
    });
});

// Endpoint to rename a file or folder
app.post('/files/rename', (req, res) => {
    const { path: oldPath, newName } = req.body;
    const newPath = path.join(path.dirname(oldPath), newName);
    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error('Error renaming file/folder:', err);
            return res.status(500).send({ success: false });
        }
        res.json({ success: true });
    });
});

// Endpoint to delete a file or folder
app.post('/files/delete', (req, res) => {
    const { path: targetPath } = req.body;
    const isDirectory = fs.lstatSync(targetPath).isDirectory();

    if (isDirectory) {
        fs.rmdir(targetPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error deleting folder:', err);
                return res.status(500).send({ success: false });
            }
            res.json({ success: true });
        });
    } else {
        fs.unlink(targetPath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send({ success: false });
            }
            res.json({ success: true });
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
