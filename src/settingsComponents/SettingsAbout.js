import React from 'react';

const SettingsAbout = () => {
  return (
    <div>
      <h2>About</h2>
      <p>WebOS System Manager</p>
      <p>All rights reserved WebOS</p>
      <p>Version: Community-Testing</p>
      <p>Developed by WebOS IT Department</p>
      <p>For technical support, contact: support@webos.com</p>
      <div className="settings-option">
          <h3>System Overview</h3>
          <p>The application is designed to provide a comprehensive interface for managing and interacting with your system, particularly for server environments. Users can navigate the file system, view and edit files, monitor system performance, execute terminal commands, and manage active processes and ports, all within a user-friendly interface. The components are interactive and customizable, allowing users to resize, move, and expand windows as needed, making it a versatile tool for system management.</p>
        </div>
        <div className="settings-option">
          <h3>Account Settings</h3>
          <p>Manage your account details, passwords, and security settings.</p>
        </div>
        <div className="settings-option">
          <h3>Terminal</h3>
          <p>You can use the Terminal to write and execute real-time commands directly, just like you would in a native command-line interface. This feature allows you to manage and control your system without leaving the application, providing a powerful tool for tasks like running scripts, managing files, or monitoring system processes on the fly.</p>
        </div>
        <div className="settings-option">
          <h3>Updates</h3>
          <p>Check for updates and manage your software versions.</p>
        </div>
    </div>
  );
};

export default SettingsAbout;
