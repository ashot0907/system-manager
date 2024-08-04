const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 5000;

app.use(cors());

const getGpuUsage = () => {
  return new Promise((resolve, reject) => {
    exec('nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        resolve(null); // No GPU found or command failed
        return;
      }
      const gpuUsages = stdout.trim().split('\n').map(Number);
      const totalGpuUsage = gpuUsages.reduce((acc, usage) => acc + usage, 0) / gpuUsages.length;
      resolve(totalGpuUsage);
    });
  });
};

app.get('/api/system', async (req, res) => {
  try {
    const data = await si.processes();
    const cpu = await si.currentLoad();
    const memory = await si.mem();
    const gpuUsage = await getGpuUsage();

    const processes = data.list
      .filter(process => process.name !== 'System Idle Process')
      .map((process, index) => ({
        ...process,
        gpu: gpuUsage !== null ? gpuUsage : 'N/A', // Use real GPU data if available, otherwise 'N/A'
        mem: process.memRss // Memory usage in bytes
      }));

    const totalCpuUsage = cpu.currentLoad.toFixed(2);
    const totalGpuUsage = gpuUsage !== null ? gpuUsage.toFixed(2) : 'N/A';
    const totalMemUsage = ((memory.used / memory.total) * 100).toFixed(2);

    res.json({
      processes,
      totalCpuUsage,
      totalGpuUsage,
      totalMemUsage,
      memory: {
        total: memory.total,
        used: memory.used,
        free: memory.total - memory.used,
      }
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
