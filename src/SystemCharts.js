import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const SystemCharts = () => {
  const [data, setData] = useState({ processes: [] });
  const chartRefs = useRef([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/system')
      .then(response => {
        setData(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    return () => {
      chartRefs.current.forEach(chart => chart && chart.destroy());
    };
  }, []);

  const getChartData = (type) => {
    const filteredTasks = data.processes.filter(p => p[type] > 0);
    const labels = filteredTasks.map(p => p.name);
    const values = filteredTasks.map(p => p[type]);

    return {
      labels,
      datasets: [{
        label: `${type.toUpperCase()} Usage`,
        data: values,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1
      }],
    };
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Bar data={getChartData('cpu')} ref={el => chartRefs.current[0] = el?.chartInstance} />
        <Bar data={getChartData('gpu')} ref={el => chartRefs.current[1] = el?.chartInstance} />
        <Bar data={getChartData('mem')} ref={el => chartRefs.current[2] = el?.chartInstance} />
      </div>
    </div>
  );
};

export default SystemCharts;
