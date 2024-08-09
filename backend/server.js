const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const { exec } = require('child_process');

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

// New route to handle terminal commands
app.post('/api/execute', (req, res) => {
  const { command } = req.body;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    res.json({ output: stdout });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
