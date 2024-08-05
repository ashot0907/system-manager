import React from 'react';
import { Container, Grid } from '@mui/material';
import AppTable from './AppTable';
import SystemCharts from './SystemCharts';
import TotalUsageDonuts from './TotalUsageDonuts';
import './App.css'

const App = () => {
  return (
    <div>
      <div id='main'>
        <div >
          <AppTable id='fr' />
        </div>
        <div>
          <SystemCharts id='sec'/>
        </div>
        <div>
          <TotalUsageDonuts id='tr' />
        </div>
      </div>
    </div>
  );
};

export default App;
