// islands/notification-settings/NotificationSettingsIsland.jsx

import React, { useState, useEffect } from 'react';
import { NotificationSettingsModal } from './components/NotificationSettingsModal.jsx';
import { supabase } from '../../lib/supabase.js';

export const NotificationSettingsIsland = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    messageForwarding: '',
    paymentReminders: '',
    promotional: '',
    reservationUpdates: '',
    leaseRequests: '',
    proposalUpdates: '',
    checkInCheckOut: '',
    reviews: '',
    tipsMarketInsights: '',
    accountAccessAssistance: '',
    virtualMeetings: '',
  });
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user and load their settings
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        // Get current user from Supabase auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Error getting user:', authError);
          setIsLoading(false);
          return;
        }

        if (!user) {
          console.log('No user logged in');
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // Fetch user's notification settings from database
        const { data, error } = await supabase
          .from('user')
          .select(`
            "Notification Settings - Message Forwarding",
            "Notification Settings - Payment Reminders",
            "Notification Settings - Promotional",
            "Notification Settings - Reservation Updates",
            "Notification Settings - Lease Requests",
            "Notification Settings - Proposal Updates",
            "Notification Settings - Check-in/Check-out Reminders",
            "Notification Settings - Reviews",
            "Notification Settings - Tips / Market Insights",
            "Notification Settings - Account Access Assistance",
            "Notification Settings - Virtual Meetings"
          `)
          .eq('_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching notification settings:', error);
        } else if (data) {
          setSettings({
            messageForwarding: data['Notification Settings - Message Forwarding'] || '',
            paymentReminders: data['Notification Settings - Payment Reminders'] || '',
            promotional: data['Notification Settings - Promotional'] || '',
            reservationUpdates: data['Notification Settings - Reservation Updates'] || '',
            leaseRequests: data['Notification Settings - Lease Requests'] || '',
            proposalUpdates: data['Notification Settings - Proposal Updates'] || '',
            checkInCheckOut: data['Notification Settings - Check-in/Check-out Reminders'] || '',
            reviews: data['Notification Settings - Reviews'] || '',
            tipsMarketInsights: data['Notification Settings - Tips / Market Insights'] || '',
            accountAccessAssistance: data['Notification Settings - Account Access Assistance'] || '',
            virtualMeetings: data['Notification Settings - Virtual Meetings'] || '',
          });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  // Listen for click on notification settings button
  useEffect(() => {
    const handleNotificationSettingsClick = (e) => {
      const target = e.target.closest('.settings-link');
      if (target && target.textContent.includes('Notification Settings')) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    document.addEventListener('click', handleNotificationSettingsClick);
    return () => document.removeEventListener('click', handleNotificationSettingsClick);
  }, []);

  // Save settings to Supabase
  const saveSettings = async (updatedSettings) => {
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { error } = await supabase
      .from('user')
      .update({
        'Notification Settings - Message Forwarding': updatedSettings.messageForwarding,
        'Notification Settings - Payment Reminders': updatedSettings.paymentReminders,
        'Notification Settings - Promotional': updatedSettings.promotional,
        'Notification Settings - Reservation Updates': updatedSettings.reservationUpdates,
        'Notification Settings - Lease Requests': updatedSettings.leaseRequests,
        'Notification Settings - Proposal Updates': updatedSettings.proposalUpdates,
        'Notification Settings - Check-in/Check-out Reminders': updatedSettings.checkInCheckOut,
        'Notification Settings - Reviews': updatedSettings.reviews,
        'Notification Settings - Tips / Market Insights': updatedSettings.tipsMarketInsights,
        'Notification Settings - Account Access Assistance': updatedSettings.accountAccessAssistance,
        'Notification Settings - Virtual Meetings': updatedSettings.virtualMeetings,
      })
      .eq('_id', userId);

    if (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }

    // Update local state
    setSettings(updatedSettings);
  };

  // Simple toast implementation (can be enhanced later)
  const showToast = ({ type, title, message }) => {
    console.log(`[${type.toUpperCase()}] ${title}: ${message || ''}`);
    // TODO: Implement proper toast notification UI if needed
  };

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  return (
    <NotificationSettingsModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      initialSettings={settings}
      onSave={saveSettings}
      showToast={showToast}
    />
  );
};
