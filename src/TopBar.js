import React, { useState, useEffect, useRef } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import './TopBar.css';
import SettingsComponent from './Settings'; // Import the SettingsComponent

const TopBar = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleBrightnessChange = (e) => {
    const newBrightness = e.target.value;
    setBrightness(newBrightness);
    document.body.style.filter = `brightness(${newBrightness})`;
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="top-bar">
      <span className="date-time">
        {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
      </span>
      <div className="icons">
        <RefreshIcon onClick={refreshPage} />
        <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
          <MenuIcon onClick={toggleDropdown} />
          <div className="dropdown-menu">
            <div className="brightness-control">
              <label htmlFor="brightness-slider">Brightness</label>
              <input
                id="brightness-slider"
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={brightness}
                onChange={handleBrightnessChange}
              />
            </div>
            <button className="dropdown-button" onClick={openSettings}>Settings</button>
            <button className="dropdown-button">Option 3</button>
            <button className="logout-button" onClick={handleLogoutShortcut}>
              <ExitToAppIcon /> Logout
            </button>
          </div>
        </div>
      </div>
      {isSettingsOpen && (
        <SettingsComponent onClose={closeSettings} />
      )}
    </div>
  );
};

export default TopBar;
