const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const multer = require('multer');
const archiver = require('archiver');
const unzipper = require('unzipper');

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());


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
        const directoryPath = req.headers['directory-path'];
        console.log('Received directory path:', directoryPath);

        if (!directoryPath || !fs.existsSync(directoryPath)) {
            console.error('Directory does not exist:', directoryPath);
            return cb(new Error('Directory does not exist on the system'), false);
        }

        cb(null, directoryPath);
    },
    filename: function (req, file, cb) {
        console.log('Saving file:', file.originalname);
        cb(null, file.originalname);
    }
});


const upload = multer({ storage: storage });

app.post('/upload', upload.array('files'), (req, res) => {
    console.log('Files uploaded successfully');
    res.send({ message: 'Files uploaded successfully!' });
});

app.post('/files/unzip', (req, res) => {
    const filePath = req.body.path;
    fs.createReadStream(filePath)
        .pipe(unzipper.Extract({ path: path.dirname(filePath) }))
        .on('close', () => res.sendStatus(200))
        .on('error', (err) => res.status(500).send('Error unzipping file: ' + err.message));
});

// Endpoint to download a file or folder
app.get('/files/download', (req, res) => {
    const filePath = req.query.path;
    if (fs.statSync(filePath).isDirectory()) {
        const zipPath = path.join(path.dirname(filePath), path.basename(filePath) + '.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip');

        output.on('close', () => {
            res.download(zipPath, () => fs.unlinkSync(zipPath));
        });
        archive.on('error', (err) => res.status(500).send('Error zipping folder: ' + err.message));

        archive.pipe(output);
        archive.directory(filePath, false);
        archive.finalize();
    } else {
        res.download(filePath);
    }
});

const updateVersion = () => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    let versionParts = packageJson.version.split('.');
    versionParts[2] = (parseInt(versionParts[2]) + 1).toString(); // Increment the patch version (third number)
    packageJson.version = versionParts.join('.');
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2)); // Save updated version
    return packageJson.version; // Return the updated version
  };
  
  // Function to get the current version
  const getCurrentVersion = () => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return packageJson.version;
  };
  
  app.post('/check-for-updates', (req, res) => {
    // Run 'git reset --hard' and 'git pull'
    exec('git reset --hard && git pull', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ message: 'Error checking for updates.' });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res.status(500).json({ message: 'Error pulling updates.' });
      }
  
      // If everything is successful, return the success message
      const updatedVersion = stdout.match(/Already up to date|Updating to (\d+\.\d+\.\d+)/) ? 'updated' : 'Already up to date';
      res.json({ message: updatedVersion, version: stdout });
    });
  });
  
  
  app.post('/hard-reset', (req, res) => {
    // Run 'git reset --hard' and './webos-ip-setup.sh'
    exec('git reset --hard && ./webos-ip-setup.sh', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ message: 'Error during hard reset.' });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res.status(500).json({ message: 'Error executing webos-ip-setup.' });
      }
  
      // If everything is successful, return the success message
      res.json({ message: 'OS hard reset successful.' });
    });
  });
  
  app.get('/version', (req, res) => {
    res.status(200).json({ version: getCurrentVersion() });
  });
    

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
