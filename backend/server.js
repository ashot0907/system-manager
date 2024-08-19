const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const systeminformation = require('systeminformation');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Function to get GPU Information
const getGpuInfo = async () => {
    const gpuData = await si.graphics();
    return gpuData.controllers.map(controller => ({
        model: controller.model || 'N/A',
        usage: controller.utilizationGpu || 0,
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

let currentDirectory = process.cwd(); 

app.post('/api/execute', (req, res) => {
    let { command } = req.body;

    if (command.startsWith('cd ')) {
        const newDir = command.slice(3).trim();
        try {
            process.chdir(newDir); 
            currentDirectory = process.cwd();
            return res.json({ output: `Changed directory to ${currentDirectory}` });
        } catch (error) {
            return res.status(500).json({ output: `cd: ${newDir}: No such file or directory` });
        }
    }

    exec(command, { cwd: currentDirectory }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ output: stderr });
        }
        res.json({ output: stdout });
    });
});

// Detect OS and handle authentication differently
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

app.get('/api/used-ports', (req, res) => {
    const platform = os.platform();
    let command;

    if (platform === 'win32') {
        command = 'netstat -ano'; // Windows equivalent to check ports
    } else {
        command = 'lsof -iTCP -sTCP:LISTEN -n -P'; // macOS/Linux
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
                const user = 'N/A'; // Windows netstat doesn't provide user info
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
