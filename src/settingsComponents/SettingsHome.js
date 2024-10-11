import React, { useState, useEffect } from 'react';
import './SettingsHome.css'; // Import the CSS file for styling
import bg1 from '../assets/bgs/bg1.jpg';
import bg2 from '../assets/bgs/bg2.jpg';
import bg3 from '../assets/bgs/bg3.jpg';

const backgrounds = [
  { id: 1, name: 'Blue Theme', src: bg1 },
  { id: 2, name: 'Dark Theme', src: bg2 },
  { id: 3, name: 'Another Dark Theme', src: bg3 },
];

const SettingsHome = () => {
  const [buttonText, setButtonText] = useState('Check for Updates');
  const [version, setVersion] = useState('v3.0');
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [customBg, setCustomBg] = useState(null); // For custom background

  useEffect(() => {
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground) {
      document.body.style.backgroundImage = `url(${savedBackground})`;
    }
  }, []);

  const handleBackgroundChange = (src) => {
    document.body.style.backgroundImage = `url(${src})`;
    localStorage.setItem('selectedBackground', src);
  };

  const handleCustomBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const customBgUrl = URL.createObjectURL(file);
      setCustomBg(customBgUrl);
      document.body.style.backgroundImage = `url(${customBgUrl})`;
      localStorage.setItem('selectedBackground', customBgUrl);
    }
  };

  const handleCheckForUpdates = () => {
    setLoading(true);
    setButtonText('Checking for Updates...');
    setUpdateMessage('');

    fetch('http://localhost:5005/check-for-updates', { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.message === 'Updated!') {
          setVersion(`v${data.version}`);
          setButtonText("You're updated to the latest version!");
        } else {
          setButtonText('Already up to date');
        }
        setUpdateMessage(data.message);
        setTimeout(() => {
          setButtonText('Check for Updates');
        }, 4000);
      })
      .catch((error) => {
        setLoading(false);
        setButtonText('Check for Updates');
        setUpdateMessage('Error checking for updates.');
      });
  };

  const handleHardReset = () => {
    setLoading(true);
    setUpdateMessage('');

    fetch('http://localhost:5005/hard-reset', { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setUpdateMessage(data.message);
        handleCheckForUpdates();
      })
      .catch((error) => {
        setLoading(false);
        setUpdateMessage('Error during hard reset.');
      });
  };

  return (
    <div className="settings-home">
      <div className="version-section">
        <h2>WebOS {version}</h2>
        <button className="update-button" onClick={handleCheckForUpdates} disabled={loading}>
          {buttonText}
        </button>
        <button className="hard-reset-button" onClick={handleHardReset} disabled={loading}>
          Hard Reset OS
        </button>
        {loading && <p>Processing...</p>}
        {updateMessage && <p>{updateMessage}</p>}
      </div>

      <div className="background-section">
        <h3>Choose Background</h3>
        <div className="background-previews">
          {backgrounds.map((bg) => (
            <div key={bg.id} className="background-item" onClick={() => handleBackgroundChange(bg.src)}>
              <img src={bg.src} alt={bg.name} />
              <p>{bg.name}</p>
            </div>
          ))}
        </div>

        <h3>Upload Custom Background</h3>
        <input type="file" accept="image/*" onChange={handleCustomBackgroundChange} />
        {customBg && <p>Custom background applied!</p>}
      </div>
    </div>
  );
};

export default SettingsHome;
