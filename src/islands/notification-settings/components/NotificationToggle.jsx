// components/NotificationToggle.jsx

import React from 'react';
import '../../../styles/NotificationToggle.css';

export const NotificationToggle = ({
  checked,
  onChange,
  disabled = false,
  color = 'royal',
}) => {
  return (
    <label className={`notification-toggle ${color}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="notification-toggle-input"
      />
      <span className="notification-toggle-slider"></span>
    </label>
  );
};
