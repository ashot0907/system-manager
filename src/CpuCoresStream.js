import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const DarkPaper = styled(Paper)({
  backgroundColor: '#333',
  color: '#fff',
});

const DarkTableCell = styled(TableCell)({
  color: '#fff',
});

const DarkTableHead = styled(TableHead)({
  backgroundColor: '#555',
});

const CpuCoresStream = () => {
  const [cpuCores, setCpuCores] = useState([]);
  const [processes, setProcesses] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000/api/system')
        .then(response => {
          setCpuCores(response.data.cpuCores || []);
          setProcesses(response.data.processes || []);
        })
        .catch(error => console.error('Error fetching data:', error));
    };

    // Fetch data immediately and then set up interval to fetch every 5 seconds
    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  const getChartData = () => {
    if (!cpuCores.length) return null;

    const labels = cpuCores.map(core => `Core ${core.index}`);
    const values = cpuCores.map(core => core.load);

    return {
      labels,
      datasets: [{
        label: 'CPU Core Usage %',
        data: values,
        borderColor: 'rgba(249, 105, 14)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: false,
      }],
    };
  };

  const chartData = getChartData();

  if (!chartData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chart-container" id='bgP'>
      <h3>CPU Cores Usage</h3>
      <Line data={chartData} />
      <h3></h3>
      <TableContainer component={DarkPaper}>
        <Table>
          <DarkTableHead>
            <TableRow>
              <DarkTableCell>Process Name</DarkTableCell>
              <DarkTableCell align="right">CPU Cores %</DarkTableCell>
            </TableRow>
          </DarkTableHead>
          <TableBody>
            {processes.map((process) => (
              <TableRow key={process.pid}>
                <DarkTableCell>{process.name}</DarkTableCell>
                <DarkTableCell align="right">{process.cpuCores.toFixed(2)}</DarkTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CpuCoresStream;
