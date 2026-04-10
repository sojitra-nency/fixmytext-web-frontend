import { useState, useEffect, useRef } from 'react';
import { PERSONAS } from '../../constants/tools';

/**
 * Dashboard profile section.
 * Allows editing display name, selecting persona, and toggling theme.
 *
 * @param {object} props
 * @param {object|null} props.user - Current user object.
 * @param {boolean} props.isAuthenticated - Whether the user is authenticated.
 * @param {object} props.g - Gamification state from useGamification hook.
 * @param {string} props.mode - Current theme mode ('light' or 'dark').
 * @param {function} props.setMode - Callback to set theme mode.
 * @param {function} props.showAlert - Callback to display alert notifications.
 */
export default function ProfileSection({ user, isAuthenticated, g, mode, setMode, showAlert }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.display_name || '');
  const nameRef = useRef(null);

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [editingName]);

  return (
    <div className="tu-dash-content">
      <h2 className="tu-dash-title">Profile</h2>
      <p className="tu-dash-subtitle">Manage your account and preferences</p>

      {/* Profile card */}
      <div className="tu-dash-card tu-dash-card--profile">
        <div className="tu-dash-profile-large">
          <div className="tu-dash-avatar-large">
            {user?.display_name?.charAt(0)?.toUpperCase() || 'G'}
          </div>
          <div className="tu-dash-profile-large-info">
            {editingName ? (
              <div className="tu-dash-profile-edit-row">
                <input
                  ref={nameRef}
                  className="tu-dash-profile-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingName(false);
                      showAlert('Display name updated (local only)', 'success');
                    }
                    if (e.key === 'Escape') {
                      setEditingName(false);
                      setNameInput(user?.display_name || '');
                    }
                  }}
                  placeholder="Display name"
                />
                <button
                  className="tu-dash-profile-save-btn"
                  onClick={() => {
                    setEditingName(false);
                    showAlert('Display name updated (local only)', 'success');
                  }}
                >
                  Save
                </button>
                <button
                  className="tu-dash-profile-cancel-btn"
                  onClick={() => {
                    setEditingName(false);
                    setNameInput(user?.display_name || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="tu-dash-profile-name-row">
                <span className="tu-dash-profile-large-name">
                  {nameInput || user?.display_name || 'Guest'}
                </span>
                <button
                  className="tu-dash-profile-edit-btn"
                  onClick={() => setEditingName(true)}
                  title="Edit name"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </div>
            )}
            <span className="tu-dash-profile-large-email">
              {user?.email || 'Not signed in'}
            </span>
            <span
              className={`tu-dash-settings-badge${
                isAuthenticated ? ' tu-dash-settings-badge--ok' : ''
              }`}
            >
              {isAuthenticated ? 'Signed in' : 'Guest'}
            </span>
          </div>
        </div>
      </div>

      {/* Persona */}
      <div className="tu-dash-card">
        <h3 className="tu-dash-card-title">Persona</h3>
        <p className="tu-dash-card-desc">
          Choose your persona to get tailored tool suggestions
        </p>
        <div className="tu-dash-persona-grid">
          {Object.entries(PERSONAS).map(([key, p]) => (
            <button
              key={key}
              className={`tu-dash-persona-card${
                g?.persona === key ? ' tu-dash-persona-card--active' : ''
              }`}
              onClick={() => {
                g.setPersona(key);
                showAlert(`Persona changed to ${p.label}`, 'success');
              }}
            >
              <span className="tu-dash-persona-icon">{p.icon}</span>
              <span className="tu-dash-persona-label">{p.label}</span>
              {g?.persona === key && <span className="tu-dash-persona-check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="tu-dash-card">
        <h3 className="tu-dash-card-title">Appearance</h3>
        <div className="tu-dash-settings-row">
          <span className="tu-dash-settings-label">Theme</span>
          <div className="tu-dash-theme-toggle">
            <button
              className={`tu-dash-theme-btn${
                mode === 'light' ? ' tu-dash-theme-btn--active' : ''
              }`}
              onClick={() => setMode('light')}
            >
              <span>☀️</span> Light
            </button>
            <button
              className={`tu-dash-theme-btn${
                mode === 'dark' ? ' tu-dash-theme-btn--active' : ''
              }`}
              onClick={() => setMode('dark')}
            >
              <span>🌙</span> Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
