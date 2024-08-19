import React, { useEffect, useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import './TopBar.css';

const TopBar = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };

  const handleLogoutShortcut = () => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: 'l',
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="top-bar">
      <span className="date-time">
        {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
      </span>
      <div className="icons">
        <RefreshIcon onClick={refreshPage} />
        <ExitToAppIcon onClick={handleLogoutShortcut} />
      </div>
    </div>
  );
};

export default TopBar;
