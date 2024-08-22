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
    axios.get('http://0.0.0.0:5000/api/system')
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
      <TablePagination
        rowsPerPageOptions={[15, 30, 45]}
        component="div"
        count={tasks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </DarkPaper>
  );
};

export default AppTable;
