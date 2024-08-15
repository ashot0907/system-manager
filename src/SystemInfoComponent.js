import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, CircularProgress } from '@mui/material';
import CpuIcon from '@mui/icons-material/Memory';
import GpuIcon from '@mui/icons-material/GraphicEq';
import MemoryIcon from '@mui/icons-material/Storage';

const SystemInfoComponent = () => {
    const [stats, setStats] = useState({
        cpuTemp: null,
        gpuTemp: null,
        memoryFree: null,
        memoryTotal: null,
        gpuMemoryFree: null,
        gpuMemoryTotal: null,
        cpuUsage: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/system-stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching system stats:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                System Information
            </Typography>
            <Box display="flex" alignItems="center">
                <CpuIcon style={{ marginRight: 8 }} />
                <Typography variant="h6">
                    CPU Temp: {stats.cpuTemp !== null ? `${stats.cpuTemp} °C` : 'N/A'}
                </Typography>
            </Box>
            <Box display="flex" alignItems="center" mt={2}>
                <MemoryIcon style={{ marginRight: 8 }} />
                <Typography variant="h6">
                    Memory: {stats.memoryFree !== null && stats.memoryTotal !== null ? `${stats.memoryFree} free / ${stats.memoryTotal} total` : <CircularProgress size={24} />}
                </Typography>
            </Box>
            <Box display="flex" alignItems="center" mt={2}>
                <GpuIcon style={{ marginRight: 8 }} />
                <Typography variant="h6">
                    GPU Temp: {stats.gpuTemp !== null ? `${stats.gpuTemp} °C` : 'N/A'}
                </Typography>
                <Typography variant="h6" mt={1}>
                    GPU Memory: {stats.gpuMemoryFree !== null && stats.gpuMemoryTotal !== null ? `${stats.gpuMemoryFree} MB free / ${stats.gpuMemoryTotal} MB total` : 'N/A'}
                </Typography>
            </Box>
        </Box>
    );
};

export default SystemInfoComponent;
