const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const multer = require('multer');


const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

let pam;
if (os.platform() === 'darwin' || os.platform() === 'linux') {
    pam = require('authenticate-pam');
}




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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.array('files'), (req, res) => {
    res.send({ message: 'Files uploaded successfully!' });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
