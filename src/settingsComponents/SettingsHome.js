import React from 'react';

const SettingsHome = () => {
  return (
    <div className="settings-home">
      <h2>Welcome to WebOS System Manager</h2>
      <p>Use the options on the left to navigate through settings.</p>
      <div className="settings-home-content">
        <div className="settings-option">
          <h3>System Overview</h3>
          <p>Get a quick overview of your system’s performance and settings.</p>
        </div>
        <div className="settings-option">
          <h3>Account Settings</h3>
          <p>Manage your account details, passwords, and security settings.</p>
        </div>
        <div className="settings-option">
          <h3>Notifications</h3>
          <p>Customize notification preferences and alerts.</p>
        </div>
        <div className="settings-option">
          <h3>Updates</h3>
          <p>Check for updates and manage your software versions.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsHome;
