import React from 'react';
import { Container, Grid } from '@mui/material';
import AppTable from './AppTable';
import SystemCharts from './SystemCharts';
import TotalUsageDonuts from './TotalUsageDonuts';

const App = () => {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AppTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <SystemCharts />
        </Grid>
        <Grid item xs={12}>
          <TotalUsageDonuts />
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
