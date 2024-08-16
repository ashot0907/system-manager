const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const { exec } = require('child_process');
const systeminformation = require('systeminformation'); // Import systeminformation

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); // Add this to parse JSON bodies

const getGpuInfo = () => {
  return new Promise((resolve, reject) => {
    exec('nvidia-smi --query-gpu=name,utilization.gpu --format=csv,noheader,nounits', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        resolve([{ model: 'N/A', usage: 0 }]); // No GPU found or command failed
        return;
      }
      const lines = stdout.trim().split('\n');
      const gpuData = lines.map(line => {
        const [model, usage] = line.split(',').map(item => item.trim());
        return { model, usage: Number(usage) };
      });
      resolve(gpuData);
    });
  });
};

// New endpoint for SystemInfo.js
app.get('/api/system-info', async (req, res) => {
  try {
    const cpuData = await si.cpu();
    const memory = await si.mem();
    const fsSizes = await si.fsSize();
    const networkInterfaces = await si.networkInterfaces();
    const wifiInterface = networkInterfaces.find(iface => iface.iface.toLowerCase().includes('en') || iface.iface.toLowerCase().includes('wifi') || iface.iface.toLowerCase().includes('wl'));

    const wifiDetails = wifiInterface ? {
      ssid: wifiInterface.ssid || 'N/A',
      mac: wifiInterface.mac || 'N/A',
      speed: wifiInterface.speed || 'N/A'
    } : { ssid: 'N/A', mac: 'N/A', speed: 'N/A' };

    // Alternative method to get SSID (especially for macOS)
    if (wifiDetails.ssid === 'N/A') {
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
        size: (fs.size / 1e9).toFixed(2), // Convert to GB
        free: (fs.available / 1e9).toFixed(2), // Convert to GB
        used: ((fs.size - fs.available) / 1e9).toFixed(2) // Convert to GB
      }));

      res.json({
        cpuModel: `${cpuData.manufacturer} ${cpuData.brand}`,
        gpuModel: 'N/A', // Adjust or update this as needed for GPU
        memory: {
          total: (memory.total / (1024 * 1024 * 1024)).toFixed(2), // Convert to GB
          used: (memory.used / (1024 * 1024 * 1024)).toFixed(2), // Convert to GB
          free: (memory.free / (1024 * 1024 * 1024)).toFixed(2)  // Convert to GB
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
    const gpuData = await getGpuInfo();
    const processesData = await si.processes();
    const cpu = await si.currentLoad();
    const memory = await si.mem();
    const fsSizes = await si.fsSize();

    // Map all CPU cores
    const cpuCores = cpu.cpus.map((core, index) => ({
      index: index + 1,
      load: core.load.toFixed(2),
    }));

    // Sort and limit processes to top 10 by CPU core usage
    const processes = processesData.list
      .filter((process) => process.name !== 'System Idle Process')
      .map((process) => ({
        ...process,
        gpu: gpuData[0].usage, // Assume one GPU for simplicity
        mem: process.memRss, // Memory usage in bytes
        cpuCores: process.cpu, // CPU cores used by the process
      }))
      .sort((a, b) => b.cpuCores - a.cpuCores) // Sort by CPU core usage
      .slice(0, 10); // Limit to top 10

    const totalCpuUsage = cpu.currentLoad.toFixed(2);
    const totalGpuUsage = gpuData.reduce((acc, gpu) => acc + gpu.usage, 0) / gpuData.length;
    const totalMemUsage = ((memory.used / memory.total) * 100).toFixed(2);

    // Aggregate disk information
    const diskInfo = fsSizes.map(fs => ({
      fs: fs.fs,
      size: (fs.size / 1e9).toFixed(2), // Convert to GB
      free: (fs.available / 1e9).toFixed(2), // Convert to GB
      used: ((fs.size - fs.available) / 1e9).toFixed(2) // Convert to GB
    }));

    res.json({
      cpuModel: `${cpuData.manufacturer} ${cpuData.brand}`,
      gpuModel: gpuData[0].model, // Assume one GPU for simplicity
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
    // Get CPU temperature
    const cpuTemp = await systeminformation.cpuTemperature();
    
    // Get memory information
    const memory = await systeminformation.mem();
    
    // Get GPU information
    const gpu = await systeminformation.graphics();
    const gpuInfo = gpu.controllers && gpu.controllers.length > 0 ? gpu.controllers[0] : {};
    const gpuTemperature = gpuInfo.temperatureGpu !== undefined ? gpuInfo.temperatureGpu : 'N/A';
    const gpuMemoryFree = gpuInfo.memoryFree !== undefined ? gpuInfo.memoryFree : 'N/A';
    const gpuMemoryTotal = gpuInfo.memoryTotal !== undefined ? gpuInfo.memoryTotal : 'N/A';

    // Convert memory values from bytes to GB and MB
    const memoryFreeGB = (memory.free / (1024 * 1024 * 1024)).toFixed(2);
    const memoryTotalGB = (memory.total / (1024 * 1024 * 1024)).toFixed(2);
    const gpuMemoryFreeMB = (gpuMemoryFree / 1024).toFixed(2);
    const gpuMemoryTotalMB = (gpuMemoryTotal / 1024).toFixed(2);

    // Respond with the system stats
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

let currentDirectory = process.cwd(); // Initialize with the current working directory

app.post('/api/execute', (req, res) => {
  let { command } = req.body;

  // Handle `cd` command
  if (command.startsWith('cd ')) {
    const newDir = command.slice(3).trim();
    try {
      process.chdir(newDir); // Change the current working directory
      currentDirectory = process.cwd();
      return res.json({ output: `Changed directory to ${currentDirectory}` });
    } catch (error) {
      return res.status(500).json({ output: `cd: ${newDir}: No such file or directory` });
    }
  }

  // Execute other commands in the current directory
  exec(command, { cwd: currentDirectory }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ output: stderr });
    }
    res.json({ output: stdout });
  });
});

// Add this route to your existing server.js code
app.get('/api/used-ports', (req, res) => {
  console.log('Received request for /api/used-ports');
  exec(`sudo lsof -iTCP -sTCP:LISTEN -n -P`, (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ error: 'Something went wrong' });
      }
      const lines = stdout.split('\n').filter(line => line.trim() !== '');
      const data = lines.slice(1).map(line => {
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
      res.json(data);
  });
});

app.post('/api/stop-process', (req, res) => {
  const { pid } = req.body;
  if (!pid) {
      return res.status(400).json({ error: 'PID is required' });
  }
  exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ error: `Failed to stop process with PID ${pid}: ${stderr}` });
      }
      res.json({ success: true, message: `Process with PID ${pid} stopped successfully` });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
