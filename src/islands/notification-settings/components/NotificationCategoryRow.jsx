// components/NotificationCategoryRow.jsx

import React from 'react';
import { NotificationToggle } from './NotificationToggle.jsx';
import '../../../styles/NotificationCategoryRow.css';

export const NotificationCategoryRow = ({
  label,
  smsChecked,
  emailChecked,
  onSmsChange,
  onEmailChange,
}) => {
  return (
    <div className="notification-category-row">
      <div className="notification-category-label">{label}</div>
      <div className="notification-category-toggles">
        <NotificationToggle
          checked={smsChecked}
          onChange={onSmsChange}
          color="royal"
        />
        <NotificationToggle
          checked={emailChecked}
          onChange={onEmailChange}
          color="royal"
        />
      </div>
    </div>
  );
};
