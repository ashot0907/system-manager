import React, { useState } from 'react';
import './SettingsUsers.css';

const SettingsUsers = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleVerifyPassword = () => {
    fetch('http://localhost:5000/api/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPasswordVerified(true);
          setErrorMessage('');
        } else {
          setErrorMessage(data.message);
          setPasswordVerified(false);
        }
      })
      .catch(error => console.error('Error verifying password:', error));
  };

  const handleUpdatePassword = () => {
    if (passwordVerified) {
      fetch('http://localhost:5000/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setSuccessMessage('Verification passed successfully');
            setErrorMessage('');
            setPasswordVerified(false);
            setCurrentPassword('');
            setNewPassword('');
          } else {
            setErrorMessage(data.message);
          }
        })
        .catch(error => console.error('Error updating password:', error));
    }
  };

  return (
    <div className="settings-users">
      <h3>Password Management</h3>
      {!passwordVerified ? (
        <div className="verify-password">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <button onClick={handleVerifyPassword}>Verify</button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
      ) : (
        <div className="change-password">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <button onClick={handleUpdatePassword}>Change Password</button>
          {successMessage && <p className="success">{successMessage}</p>}
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default SettingsUsers;
