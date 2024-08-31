import React from 'react';

const SettingsAbout = () => {
  return (
    <div>
      <h2>About</h2>
      <p>WebOS System Manager</p>
      <p>All rights reserved WebOS</p>
      <p>Version: 3.0.0</p>
      <p>Developed by WebOS IT Department</p>
      <p>For technical support, contact: support@webos.com</p>
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
  );
};

export default SettingsAbout;
