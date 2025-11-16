import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [usernameForm, setUsernameForm] = useState({
    newUsername: '',
    password: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, updateUser, changeUsername, changePassword, updateAvatar } = useAuthStore();
  const { theme, setTheme, fontSize, setFontSize } = useThemeStore();
  const navigate = useNavigate();

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await changeUsername(usernameForm.newUsername, usernameForm.password);
    
    if (result.success) {
      setMessage(result.message);
      setUsernameForm({ newUsername: '', password: '' });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    if (result.success) {
      setMessage(result.message);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleAvatarChange = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const result = await updateAvatar(formData);
    
    if (result.success) {
      setMessage(result.message);
      setAvatarFile(null);
      // Clear file input
      const fileInput = document.getElementById('avatar');
      if (fileInput) fileInput.value = '';
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <div className="container">
          <div className="header-content">
            <h1>Settings</h1>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button 
              className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              Appearance
            </button>
          </div>

          <div className="settings-panel card">
            {activeTab === 'account' && (
              <div>
                <h2>Account Settings</h2>
                
                <div className="avatar-section">
                  <h3>Profile Picture</h3>
                  <div className="avatar-preview">
                    {user?.avatar && user.avatar !== '/uploads/default-avatar.png' ? (
                      <img src={user.avatar} alt="Avatar" className="avatar-large" />
                    ) : (
                      <div className="avatar-large default">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleAvatarChange} className="avatar-form">
                    <div className="form-group">
                      <input
                        type="file"
                        id="avatar"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!avatarFile || loading}
                    >
                      {loading ? 'Uploading...' : 'Update Avatar'}
                    </button>
                  </form>
                </div>

                <div className="form-section">
                  <h3>Change Username</h3>
                  <form onSubmit={handleUsernameChange}>
                    <div className="form-group">
                      <label className="form-label">New Username</label>
                      <input
                        type="text"
                        value={usernameForm.newUsername}
                        onChange={(e) => setUsernameForm(prev => ({
                          ...prev,
                          newUsername: e.target.value
                        }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        value={usernameForm.password}
                        onChange={(e) => setUsernameForm(prev => ({
                          ...prev,
                          password: e.target.value
                        }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Username'}
                    </button>
                  </form>
                </div>

                <div className="form-section">
                  <h3>Change Password</h3>
                  <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2>Appearance Settings</h2>
                
                <div className="form-section">
                  <h3>Theme</h3>
                  <div className="theme-options">
                    <label className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={theme === 'system'}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                      <span>System</span>
                    </label>
                    <label className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={theme === 'light'}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                      <span>Light</span>
                    </label>
                    <label className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={theme === 'dark'}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                      <span>Dark</span>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Font Size</h3>
                  <div className="font-size-options">
                    <label className="font-size-option">
                      <input
                        type="radio"
                        name="fontSize"
                        value="small"
                        checked={fontSize === 'small'}
                        onChange={(e) => setFontSize(e.target.value)}
                      />
                      <span>Small</span>
                    </label>
                    <label className="font-size-option">
                      <input
                        type="radio"
                        name="fontSize"
                        value="medium"
                        checked={fontSize === 'medium'}
                        onChange={(e) => setFontSize(e.target.value)}
                      />
                      <span>Medium</span>
                    </label>
                    <label className="font-size-option">
                      <input
                        type="radio"
                        name="fontSize"
                        value="large"
                        checked={fontSize === 'large'}
                        onChange={(e) => setFontSize(e.target.value)}
                      />
                      <span>Large</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
