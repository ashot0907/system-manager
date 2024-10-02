import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, styled } from '@mui/material';

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

const AppTable = () => {
  const [tasks, setTasks] = useState([]);
  const [totalCpuUsage, setTotalCpuUsage] = useState(0);
  const [totalGpuUsage, setTotalGpuUsage] = useState('N/A');
  const [totalMemUsage, setTotalMemUsage] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000/api/system')
        .then(response => {
          const sortedTasks = response.data.processes
            .filter(task => task.cpu > 0 || task.gpu > 0 || task.mem > 0)
            .sort((a, b) => b.cpu - a.cpu);
          setTasks(sortedTasks);
          setTotalCpuUsage(response.data.totalCpuUsage);
          setTotalGpuUsage(response.data.totalGpuUsage);
          setTotalMemUsage(response.data.totalMemUsage);
        })
        .catch(error => console.error(error));
    };

    // Fetch the data every 5 seconds
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DarkPaper>
      <TableContainer>
        <Table>
          <DarkTableHead>
            <TableRow>
              <DarkTableCell>Task Name</DarkTableCell>
              <DarkTableCell align="right">CPU % (Total: {totalCpuUsage}%)</DarkTableCell>
              <DarkTableCell align="right">GPU % (Total: {totalGpuUsage}%)</DarkTableCell>
              <DarkTableCell align="right">Memory MB (Total: {totalMemUsage}%)</DarkTableCell>
            </TableRow>
          </DarkTableHead>
          <TableBody>
            {tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => (
              <TableRow key={task.pid}>
                <DarkTableCell>{task.name}</DarkTableCell>
                <DarkTableCell align="right">{task.cpu.toFixed(2)}</DarkTableCell>
                <DarkTableCell align="right">{typeof task.gpu === 'number' ? task.gpu.toFixed(2) : task.gpu}</DarkTableCell>
                <DarkTableCell align="right">{(task.mem / 1024 / 1024).toFixed(2)}</DarkTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DarkPaper>
  );
};

export default AppTable;
