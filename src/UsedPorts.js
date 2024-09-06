import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';

const UsedPorts = () => {
    const [portsData, setPortsData] = useState([]);

    useEffect(() => {
        fetchPortsData();
    }, []);

    const fetchPortsData = () => {
        axios.get('http://localhost:5000/api/used-ports')
            .then(response => setPortsData(response.data))
            .catch(error => {
                console.error('Error fetching ports data:', error);
                console.error('Error response:', error.response);
                console.error('Error request:', error.request);
            });
    };

    const stopProcess = (pid) => {
        axios.post('http://localhost:5000/api/stop-process', { pid })
            .then(response => {
                alert(`Process with PID ${pid} stopped successfully`);
                fetchPortsData(); // Refresh data after stopping process
            })
            .catch(error => alert(`Failed to stop process with PID ${pid}`));
    };

    return (
        <TableContainer component={Paper} style={{ backgroundColor: '#333', width:'100%'}}>
            <Table aria-label="used ports table">
                <TableHead>
                    <TableRow>
                        <TableCell style={{ color: '#fff' }}>User</TableCell>
                        <TableCell style={{ color: '#fff' }}>Port</TableCell>
                        <TableCell style={{ color: '#fff' }}>PID</TableCell>
                        <TableCell style={{ color: '#fff' }}>Command</TableCell>
                        <TableCell style={{ color: '#fff' }}>Arguments</TableCell>
                        <TableCell style={{ color: '#fff' }}>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {portsData.map((portInfo, index) => (
                        <TableRow key={index}>
                            <TableCell style={{ color: '#fff' }}>{portInfo.user}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{portInfo.port}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{portInfo.pid}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{portInfo.command}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{portInfo.args}</TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => stopProcess(portInfo.pid)}
                                >
                                    STOP
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UsedPorts;
