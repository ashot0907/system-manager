// Settings.js
import React from 'react';
import './Settings.css';

const Settings = ({ onClose }) => {
  const themeImages = [
    { name: 'blueTheme', src: require('./assets/themes/blueTheme.jpg') },
    { name: 'darkTheme1', src: require('./assets/themes/darkTheme1.jpg') },
    { name: 'darkTheme2', src: require('./assets/themes/darkTheme2.jpg') },
    { name: 'redTheme', src: require('./assets/themes/redTheme.jpg') },
    { name: 'whiteTheme', src: require('./assets/themes/whiteTheme.jpg') },
    { name: 'GreenTheme', src: require('./assets/themes/GreenTheme.jpg') },
  ];

  const handleImageClick = (image) => {
    document.body.style.backgroundImage = `url(${image.src})`;
  };

  return (
    <div className="settings-popup">
      <button className="close-button" onClick={onClose}>Close</button>
      <h2>Choose Background</h2>
      <div className="theme-previews">
        {themeImages.map((image) => (
          <div key={image.name} className="theme-preview" onClick={() => handleImageClick(image)}>
            <img src={image.src} alt={image.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
