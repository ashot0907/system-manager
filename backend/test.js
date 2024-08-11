const si = require('systeminformation');

(async () => {
  try {
    // Get CPU temperature
    const cpuTemp = await si.cpuTemperature();
    console.log(`CPU Temperature: ${cpuTemp.main} °C`);
  } catch (error) {
    console.error('Error:', error);
  }
})();
