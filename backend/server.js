const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 5000;

app.use(cors());

const getGpuInfo = () => {
  return new Promise((resolve, reject) => {
    exec('nvidia-smi --query-gpu=name --format=csv,noheader,nounits', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        resolve('N/A'); // No GPU found or command failed
        return;
      }
      const gpuModel = stdout.trim();
      resolve(gpuModel);
    });
  });
};

app.get('/api/system', async (req, res) => {
  try {
    const cpuData = await si.cpu();
    const gpuModel = await getGpuInfo();
    const data = await si.processes();
    const cpu = await si.currentLoad();
    const memory = await si.mem();
    const fsSizes = await si.fsSize();

    // Map all CPU cores
    const cpuCores = cpu.cpus.map((core, index) => ({
      index: index + 1,
      load: core.load.toFixed(2),
    }));

    // Sort and limit processes to top 10 by CPU core usage
    const processes = data.list
      .filter((process) => process.name !== 'System Idle Process')
      .map((process) => ({
        ...process,
        gpu: gpuModel !== 'N/A' ? gpuModel : 'N/A', // Use real GPU data if available, otherwise 'N/A'
        mem: process.memRss, // Memory usage in bytes
        cpuCores: process.cpu, // CPU cores used by the process
      }))
      .sort((a, b) => b.cpuCores - a.cpuCores) // Sort by CPU core usage
      .slice(0, 10); // Limit to top 10

    const totalCpuUsage = cpu.currentLoad.toFixed(2);
    const totalGpuUsage = gpuModel !== 'N/A' ? gpuModel : 'N/A';
    const totalMemUsage = ((memory.used / memory.total) * 100).toFixed(2);

    // Aggregate disk information
    const diskInfo = fsSizes.map(fs => ({
      fs: fs.fs,
      size: (fs.size / 1e9).toFixed(2), // Convert to GB
      free: (fs.available / 1e9).toFixed(2), // Convert to GB
      used: ((fs.size - fs.available) / 1e9).toFixed(2) // Convert to GB
    }));

    res.json({
      cpuModel: cpuData.manufacturer + ' ' + cpuData.brand,
      gpuModel,
      processes,
      totalCpuUsage,
      totalGpuUsage,
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
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
