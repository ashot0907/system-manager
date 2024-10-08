import React, { useState, useEffect, useRef } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import './TopBar.css';
import SettingsComponent from './Settings'; 
import Deploy from './Deploy'; // Import the Deploy component
import { useAuth } from './AuthContext';
import Draggable from 'react-draggable';

const TopBar = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false); // State for Deploy visibility
  const [brightness, setBrightness] = useState(1);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();

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

  useEffect(() => {
    const handleLogoutShortcut = (event) => {
      if (event.ctrlKey && event.key === 'l') {
        logout();
      }
    };
    window.addEventListener('keydown', handleLogoutShortcut);
    return () => {
      window.removeEventListener('keydown', handleLogoutShortcut);
    };
  }, [logout]);

  const refreshPage = () => {
    window.location.reload();
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
    setIsDropdownOpen(false);
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const openDeploy = () => {
    setIsDropdownOpen(false);
    setIsDeployOpen(true); // Open Deploy component
  };

  const closeDeploy = () => {
    setIsDeployOpen(false); // Close Deploy component
  };

  const handleOptionClick = () => {
    setIsDropdownOpen(false);
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
            <button className="dropdown-button" onClick={openDeploy}>Deployment</button> {/* Opens Deploy */}
            <button className="logout-button" onClick={() => { logout(); handleOptionClick(); }}>
              <ExitToAppIcon /> Logout
            </button>
          </div>
        </div>
      </div>
      {isSettingsOpen && (
        <SettingsComponent onClose={closeSettings} />
      )}
      {isDeployOpen && ( // Render Deploy component when state is true
        <Draggable handle=".drag-handleD" defaultPosition={{ x: -1000, y: window.innerHeight / 2 - 200 }}>
          <div>
            <Deploy onClose={closeDeploy} />
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default TopBar;
