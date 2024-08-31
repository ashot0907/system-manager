import React, { useState } from 'react';
import './SettingsHome.css'; // Import the CSS file for styling

import bg1 from '../assets/bgs/bg1.jpg';
import bg2 from '../assets/bgs/bg2.jpg';
import bg3 from '../assets/bgs/bg3.jpg';

const backgrounds = [
  { id: 1, name: 'Blue Theme', src: bg1 },
  { id: 2, name: 'Dark Theme', src: bg2 },
  { id: 3, name: 'Dark Theme', src: bg3 },

];

const SettingsHome = () => {
  const [buttonText, setButtonText] = useState('Check for Updates');

  const handleBackgroundChange = (src) => {
    document.body.style.backgroundImage = `url(${src})`;
  };

  const handleCheckForUpdates = () => {
    setButtonText("You're updated to the latest version!");

    setTimeout(() => {
      setButtonText('Check for Updates');
    }, 4000); // Revert the text back after 4 seconds
  };

  return (
    <div className="settings-home">
      <div className="version-section">
        <h2>WebOS v3.0</h2>
        <button className="update-button" onClick={handleCheckForUpdates}>
          {buttonText}
        </button>
      </div>

      <div className="background-section">
        <h3>Choose Background</h3>
        <div className="background-previews">
          {backgrounds.map(bg => (
            <div key={bg.id} className="background-item" onClick={() => handleBackgroundChange(bg.src)}>
              <img src={bg.src} alt={bg.name} />
              <p>{bg.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsHome;
