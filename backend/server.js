const express = require('express');
const path = require('path');
const si = require('systeminformation');
require('dotenv').config();
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const systeminformation = require('systeminformation');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const pty = require('node-pty');
const expressWs = require('express-ws');




const app = express();
const port = 5000;
expressWs(app);  // Добавляем поддержку WebSocket


let hashedAdminPassword;


app.use(cors());
app.use(express.json());

// Function to get GPU Information
const getGpuInfo = async () => {
    const gpuData = await si.graphics();

    // Check if gpuData or controllers exist and are an array
    if (!gpuData || !Array.isArray(gpuData.controllers) || gpuData.controllers.length === 0) {
        return [{ model: 'No GPU Found', usage: 0 }];
    }

    return gpuData.controllers.map(controller => ({
        model: controller.model || 'N/A',
        usage: controller.utilizationGpu !== undefined ? controller.utilizationGpu : 0, // Safe access to utilizationGpu
    }));
};

// New endpoint for SystemInfo.js
app.get('/api/system-info', async (req, res) => {
    try {
        const cpuData = await si.cpu();
        const memory = await si.mem();
        const fsSizes = await si.fsSize();
        const networkInterfaces = await si.networkInterfaces();
        const gpuInfo = await getGpuInfo();

        const wifiInterface = networkInterfaces.find(iface => iface.iface.toLowerCase().includes('en') || iface.iface.toLowerCase().includes('wifi') || iface.iface.toLowerCase().includes('wl'));
        const wifiDetails = wifiInterface ? {
            ssid: wifiInterface.ssid || 'N/A',
            mac: wifiInterface.mac || 'N/A',
            speed: wifiInterface.speed || 'N/A'
        } : { ssid: 'N/A', mac: 'N/A', speed: 'N/A' };

        if (wifiDetails.ssid === 'N/A' && os.platform() === 'darwin') {
            exec('networksetup -getairportnetwork en0', (err, stdout) => {
                if (!err && stdout) {
                    const ssidMatch = stdout.match(/Current Wi-Fi Network: (.*)/);
                    if (ssidMatch && ssidMatch[1]) {
                        wifiDetails.ssid = ssidMatch[1];
                    }
                }
                sendResponse();
            });
        } else {
            sendResponse();
        }

        function sendResponse() {
            const diskInfo = fsSizes.map(fs => ({
                fs: fs.fs,
                size: (fs.size / 1e9).toFixed(2),
                free: (fs.available / 1e9).toFixed(2),
                used: ((fs.size - fs.available) / 1e9).toFixed(2)
            }));

            res.json({
                cpuModel: `${cpuData.manufacturer} ${cpuData.brand}`,
                gpuModel: gpuInfo.length > 0 ? gpuInfo[0].model : 'No GPU Found',
                memory: {
                    total: (memory.total / (1024 * 1024 * 1024)).toFixed(2),
                    used: (memory.used / (1024 * 1024 * 1024)).toFixed(2),
                    free: (memory.free / (1024 * 1024 * 1024)).toFixed(2)
                },
                disks: diskInfo,
                ipAddresses: networkInterfaces.map(iface => iface.ip4).filter(ip => ip),
                wifi: wifiDetails
            });
        }
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).send(error.toString());
    }
});

app.get('/api/system', async (req, res) => {
    try {
        const cpuData = await si.cpu();
        const gpuInfo = await getGpuInfo();
        const processesData = await si.processes();
        const cpu = await si.currentLoad();
        const memory = await si.mem();
        const fsSizes = await si.fsSize();

        const cpuCores = cpu.cpus.map((core, index) => ({
            index: index + 1,
            load: core.load.toFixed(2),
        }));

        const processes = processesData.list
            .filter((process) => process.name !== 'System Idle Process')
            .map((process) => ({
                ...process,
                gpu: gpuInfo[0].usage,
                mem: process.memRss,
                cpuCores: process.cpu,
            }))
            .sort((a, b) => b.cpuCores - a.cpuCores)
            .slice(0, 10);

        const totalCpuUsage = cpu.currentLoad.toFixed(2);
        const totalGpuUsage = gpuInfo.reduce((acc, gpu) => acc + gpu.usage, 0) / gpuInfo.length;
        const totalMemUsage = ((memory.used / memory.total) * 100).toFixed(2);

        const diskInfo = fsSizes.map(fs => ({
            fs: fs.fs,
            size: (fs.size / 1e9).toFixed(2),
            free: (fs.available / 1e9).toFixed(2),
            used: ((fs.size - fs.available) / 1e9).toFixed(2)
        }));

        res.json({
            cpuModel: `${cpuData.manufacturer} ${cpuData.brand}`,
            gpuModel: gpuInfo.length > 0 ? gpuInfo[0].model : 'No GPU Found',
            processes,
            totalCpuUsage,
            totalGpuUsage: totalGpuUsage.toFixed(2),
            totalMemUsage,
            memory: {
                total: memory.total,
                used: memory.used,
                free: memory.total - memory.used,
            },
            disks: diskInfo,
            cpuCores,
        });
    } catch (error) {
        console.error('Error fetching system data:', error);
        res.status(500).send(error.toString());
    }
});

app.get('/api/system-stats', async (req, res) => {
    try {
        const cpuTemp = await systeminformation.cpuTemperature();
        const memory = await systeminformation.mem();
        const gpu = await systeminformation.graphics();
        const gpuInfo = gpu.controllers && gpu.controllers.length > 0 ? gpu.controllers[0] : {};
        const gpuTemperature = gpuInfo.temperatureGpu !== undefined ? gpuInfo.temperatureGpu : 'N/A';
        const gpuMemoryFree = gpuInfo.memoryFree !== undefined ? gpuInfo.memoryFree : 'N/A';
        const gpuMemoryTotal = gpuInfo.memoryTotal !== undefined ? gpuInfo.memoryTotal : 'N/A';

        const memoryFreeGB = (memory.free / (1024 * 1024 * 1024)).toFixed(2);
        const memoryTotalGB = (memory.total / (1024 * 1024 * 1024)).toFixed(2);
        const gpuMemoryFreeMB = (gpuMemoryFree / 1024).toFixed(2);
        const gpuMemoryTotalMB = (gpuMemoryTotal / 1024).toFixed(2);

        res.json({
            cpuTemp: cpuTemp.main !== null ? cpuTemp.main : 'N/A',
            gpuTemp: gpuTemperature,
            memoryFree: `${memoryFreeGB} GB`,
            memoryTotal: `${memoryTotalGB} GB`,
            gpuMemoryFree: `${gpuMemoryFreeMB} MB`,
            gpuMemoryTotal: `${gpuMemoryTotalMB} MB`,
            cpuUsage: cpuTemp.current !== null ? cpuTemp.current : 'N/A',
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        res.status(500).send('Error fetching system stats');
    }
});

// Статические файлы (например, React приложение)
app.use(express.static(path.join(__dirname, 'build')));

// WebSocket для обработки терминальных команд
app.ws('/ws-terminal', (ws, req) => {
    // Создаём терминал (bash)
    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env,
    });

    // Передача данных из терминала в клиент
    shell.on('data', (data) => {
        ws.send(data);
    });

    // Получение команды от клиента и выполнение её в терминале
    ws.on('message', (msg) => {
        shell.write(msg);
    });

    ws.on('close', () => {
        shell.kill();
    });
});

const SECRET_KEY = process.env.SECRET_KEY || 'Web';

const jwt = require('jsonwebtoken');

// Hash the ADMIN_PASSWORD at server startup
bcrypt.hash(process.env.ADMIN_PASSWORD, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      hashedAdminPassword = hash;
      console.log('Admin password hashed successfully');
    }
  });

// Detect OS and handle authentication differently
app.post('/api/authenticate', async (req, res) => {
    const { password } = req.body;
  
    try {
      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(password, hashedAdminPassword);
      if (passwordMatch) {
        // Create and send a JWT token
        const token = jwt.sign({ authenticated: true }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: 'Authentication failed' });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/verify-token', (req, res) => {
    const { token } = req.body;
    try {
      jwt.verify(token, SECRET_KEY);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  });
  
  app.get('/api/protected-data', (req, res) => {
    const token = req.headers['authorization'].split(' ')[1]; // Extract token from Authorization header
    try {
      jwt.verify(token, SECRET_KEY);
      res.json({ data: 'This is protected data.' });
    } catch (err) {
      res.status(401).json({ message: 'Unauthorized access' });
    }
  });


app.post('/api/stop-process', (req, res) => {
    const { pid } = req.body;
    if (!pid) {
        return res.status(400).json({ error: 'PID is required' });
    }

    const platform = os.platform();
    const command = platform === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error stopping process: ${error}`);
            return res.status(500).json({ error: `Failed to stop process with PID ${pid}: ${stderr}` });
        }
        res.json({ success: true, message: `Process with PID ${pid} stopped successfully` });
    });
});

const envPath = path.join(__dirname, '.env');

// Get current password (for demonstration purposes)
app.get('/api/password', (req, res) => {
  res.json({ password: process.env.ADMIN_PASSWORD });
});

const loadPassword = async () => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  };

  loadPassword();


// Verify password
app.post('/api/verify-password', async (req, res) => {
  const { password } = req.body;

  // Check if the entered password matches the stored hashed password
  const isMatch = await bcrypt.compare(password, hashedAdminPassword);
  if (isMatch) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

// Update password (Note: Updating .env programmatically is not typical and should be done cautiously)
app.post('/api/update-password', async (req, res) => {
    const { newPassword } = req.body;
  
    // Hash the new password
    hashedAdminPassword = await bcrypt.hash(newPassword, 10);
  
    // Update the password in the .env file
    const envData = fs.readFileSync(envPath, 'utf8');
    const updatedEnvData = envData.replace(/ADMIN_PASSWORD=.*/, `ADMIN_PASSWORD=${newPassword}`);
    
    fs.writeFileSync(envPath, updatedEnvData, 'utf8');
  
    // Respond with success message
    res.json({ success: true, message: 'Password updated successfully' });
  });

const upload = multer({ dest: 'uploads/' });

let servers = [];

function checkIfRunning(port, callback) {
  exec(`lsof -i:${port}`, (error, stdout) => {
    if (error) {
      callback(false);
    } else {
      callback(true);
    }
  });
}

app.post('/start-server', upload.array('files'), (req, res) => {
  const port = req.body.port;
  const folderPath = path.join(__dirname, 'uploads', Date.now().toString());

  fs.mkdirSync(folderPath);

  req.files.forEach(file => {
    const targetPath = path.join(folderPath, file.originalname);
    fs.renameSync(file.path, targetPath);
  });

  const staticServerCommand = `npx http-server ${folderPath} -p ${port}`;
  
  exec(staticServerCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error.message}`);
      return res.status(500).send('Failed to start server');
    }
    
    servers.push({ folderPath, port, name: req.files[0].originalname, status: 'Running' });
    console.log(`Server started on port ${port}`);
    res.send(`Server started on port ${port}`);
  });
});

app.get('/servers', (req, res) => {
  servers.forEach((server, index) => {
    checkIfRunning(server.port, (isRunning) => {
      servers[index].status = isRunning ? 'Running' : 'Not Running';
    });
  });

  res.json(servers);
});

app.get('/api/used-ports', (req, res) => {
    const platform = os.platform();
    let command;

    if (platform === 'win32') {
        command = 'netstat -ano'; 
    } else {
        command = 'lsof -iTCP -sTCP:LISTEN -n -P';
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        let data;
        if (platform === 'win32') {
            const lines = stdout.split('\n').filter(line => line.trim() !== '');
            data = lines.slice(4).map(line => {
                const parts = line.trim().split(/\s+/);
                const [protocol, localAddress, , pid] = parts;
                const [address, port] = localAddress.split(':');
                const user = 'N/A'; 
                return {
                    user,
                    port,
                    pid,
                    command: protocol,
                    args: address
                };
            });
        } else {
            const lines = stdout.split('\n').filter(line => line.trim() !== '');
            data = lines.slice(1).map(line => {
                const parts = line.trim().split(/\s+/);
                const [command, pid, user, , , , , , port] = parts;
                const args = parts.slice(8).join(' ');
                return {
                    user,
                    port,
                    pid,
                    command,
                    args
                };
            });
        }

        res.json(data);
    });
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
