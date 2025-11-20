// components/NotificationSettingsModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { NotificationCategoryRow } from './NotificationCategoryRow.jsx';
import { NOTIFICATION_CATEGORIES } from '../config/notificationCategories.js';
import { getCategoryLabel } from '../utils/notificationHelpers.js';
import '../../../styles/NotificationSettingsModal.css';

export const NotificationSettingsModal = ({
  isOpen,
  onClose,
  initialSettings,
  onSave,
  showToast,
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Reset settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings);
    }
  }, [initialSettings, isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Check if a notification type is enabled for a category
   * Implements Bubble's conditional logic
   */
  const isTypeEnabled = useCallback(
    (category, type) => {
      const value = settings[category] || '';
      return value.includes(type);
    },
    [settings]
  );

  /**
   * Handles toggle changes - implements Bubble's two-step workflow
   * Step 1: If unchecked → remove notification type
   * Step 2: If checked → add notification type
   */
  const toggleNotification = useCallback(
    async (category, type, enabled) => {
      try {
        setIsSaving(true);

        // Get current value
        const currentValue = settings[category] || '';

        // Parse existing types
        const existingTypes = currentValue
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0);

        let newValue;

        if (enabled) {
          // Step 2: Add the notification type (when checked)
          if (!existingTypes.includes(type)) {
            existingTypes.push(type);
          }
          newValue = existingTypes.join(', ');
        } else {
          // Step 1: Remove the notification type (when unchecked)
          const filtered = existingTypes.filter((t) => t !== type);
          newValue = filtered.join(', ');
        }

        // Create updated settings object
        const updatedSettings = {
          ...settings,
          [category]: newValue,
        };

        // Update local state immediately (optimistic update)
        setSettings(updatedSettings);

        // Save to backend
        await onSave(updatedSettings);

        // Show success toast if available
        if (showToast) {
          showToast({
            type: 'success',
            title: 'Settings Updated',
            message: `${type} notifications ${enabled ? 'enabled' : 'disabled'} for ${getCategoryLabel(
              category
            )}`,
          });
        }
      } catch (error) {
        // Revert on error
        setSettings(settings);

        // Show error toast if available
        if (showToast) {
          showToast({
            type: 'error',
            title: 'Update Failed',
            message: 'Failed to update notification settings. Please try again.',
          });
        }

        console.error('Failed to toggle notification:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [settings, onSave, showToast]
  );

  if (!isOpen) return null;

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button - Maps to Bubble's "I: close image is clicked" */}
        <button className="notification-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Header */}
        <div className="notification-modal-header">
          <h2 className="notification-modal-title">Notification Settings</h2>
          <p className="notification-modal-subtitle">Choose your preferred modes of communication</p>
        </div>

        {/* Table Header */}
        <div className="notification-table-header">
          <div className="notification-table-header-label">Notification Type</div>
          <div className="notification-table-header-types">
            <span>SMS</span>
            <span>Email</span>
          </div>
        </div>

        {/* Categories */}
        <div className="notification-categories">
          {NOTIFICATION_CATEGORIES.map((category) => (
            <NotificationCategoryRow
              key={category.id}
              label={category.label}
              smsChecked={isTypeEnabled(category.key, 'SMS')}
              emailChecked={isTypeEnabled(category.key, 'Email')}
              onSmsChange={(checked) => toggleNotification(category.key, 'SMS', checked)}
              onEmailChange={(checked) => toggleNotification(category.key, 'Email', checked)}
            />
          ))}
        </div>

        {/* Loading Indicator */}
        {isSaving && <div className="notification-saving-indicator">Saving...</div>}
      </div>
    </div>
  );
};
