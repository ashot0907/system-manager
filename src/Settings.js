import React, { useState } from 'react';
import Draggable from 'react-draggable';
import './Settings.css';
import SettingsHome from './settingsComponents/SettingsHome';
import SettingsUsers from './settingsComponents/SettingsUsers';
import SettingsAbout from './settingsComponents/SettingsAbout';

const SettingsComponent = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // Reset position when entering/exiting fullscreen
    setPosition({ x: 0, y: 0 });
  };

  const onDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <SettingsHome />;
      case 'users':
        return <SettingsUsers />;
      case 'about':
        return <SettingsAbout />;
      default:
        return null;
    }
  };

  return (
    <Draggable
      handle=".settings-header"
      position={isFullScreen ? { x: 0, y: 0 } : position}
      onDrag={onDrag}
      disabled={isFullScreen} // Disable dragging in fullscreen mode
    >
      <div className={`settings-window ${isFullScreen ? 'fullscreen' : ''}`}>
        <div className="settings-header">
          <div className="mac-buttons">
            <button className="mac-btn red" onClick={onClose}></button>
            <button className="mac-btn yellow" onClick={handleFullScreen}></button>
            <button className="mac-btn green" onClick={handleFullScreen}></button>
          </div>
        </div>
        <div className="settings-body">
          <nav className="settings-sidebar">
            <ul>
              <li className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</li>
              <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</li>
              <li className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About</li>
            </ul>
          </nav>
          <div className="settings-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default SettingsComponent;
