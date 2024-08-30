import React, { useEffect, useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import './TopBar.css';

const TopBar = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="top-bar">
      <span className="date-time">
        {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
      </span>
      <div className="icons">
        <RefreshIcon onClick={refreshPage} />
        <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`}>
          <MenuIcon onClick={toggleDropdown} />
          <div className="dropdown-menu">
            <button className="dropdown-button">Option 1</button>
            <button className="dropdown-button">Option 2</button>
            <button className="dropdown-button">Option 3</button>
            <button className="logout-button" onClick={handleLogoutShortcut}>
              <ExitToAppIcon /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
