// islands/notification-settings/NotificationSettingsIsland.jsx

import React, { useState, useEffect } from 'react';
import { NotificationSettingsModal } from './components/NotificationSettingsModal.jsx';
import { supabase } from '../../lib/supabase.js';

export const NotificationSettingsIsland = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    messageForwarding: { sms: false, email: false },
    paymentReminders: { sms: false, email: false },
    promotional: { sms: false, email: false },
    reservationUpdates: { sms: false, email: false },
    leaseRequests: { sms: false, email: false },
    proposalUpdates: { sms: false, email: false },
    checkInCheckOut: { sms: false, email: false },
    reviews: { sms: false, email: false },
    tipsMarketInsights: { sms: false, email: false },
    accountAccessAssistance: { sms: false, email: false },
    virtualMeetings: { sms: false, email: false },
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
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // If no preferences exist yet (404), use defaults
          if (error.code === 'PGRST116') {
            console.log('No notification preferences found, using defaults');
          } else {
            console.error('Error fetching notification settings:', error);
          }
        } else if (data) {
          setSettings({
            messageForwarding: {
              sms: data.message_forwarding_sms || false,
              email: data.message_forwarding_email || false
            },
            paymentReminders: {
              sms: data.payment_reminders_sms || false,
              email: data.payment_reminders_email || false
            },
            promotional: {
              sms: data.promotional_sms || false,
              email: data.promotional_email || false
            },
            reservationUpdates: {
              sms: data.reservation_updates_sms || false,
              email: data.reservation_updates_email || false
            },
            leaseRequests: {
              sms: data.lease_requests_sms || false,
              email: data.lease_requests_email || false
            },
            proposalUpdates: {
              sms: data.proposal_updates_sms || false,
              email: data.proposal_updates_email || false
            },
            checkInCheckOut: {
              sms: data.checkin_checkout_sms || false,
              email: data.checkin_checkout_email || false
            },
            reviews: {
              sms: data.reviews_sms || false,
              email: data.reviews_email || false
            },
            tipsMarketInsights: {
              sms: data.tips_insights_sms || false,
              email: data.tips_insights_email || false
            },
            accountAccessAssistance: {
              sms: data.account_assistance_sms || false,
              email: data.account_assistance_email || false
            },
            virtualMeetings: {
              sms: data.virtual_meetings_sms || false,
              email: data.virtual_meetings_email || false
            },
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

    // Prepare the data for upsert
    const dbData = {
      user_id: userId,
      message_forwarding_sms: updatedSettings.messageForwarding.sms,
      message_forwarding_email: updatedSettings.messageForwarding.email,
      payment_reminders_sms: updatedSettings.paymentReminders.sms,
      payment_reminders_email: updatedSettings.paymentReminders.email,
      promotional_sms: updatedSettings.promotional.sms,
      promotional_email: updatedSettings.promotional.email,
      reservation_updates_sms: updatedSettings.reservationUpdates.sms,
      reservation_updates_email: updatedSettings.reservationUpdates.email,
      lease_requests_sms: updatedSettings.leaseRequests.sms,
      lease_requests_email: updatedSettings.leaseRequests.email,
      proposal_updates_sms: updatedSettings.proposalUpdates.sms,
      proposal_updates_email: updatedSettings.proposalUpdates.email,
      checkin_checkout_sms: updatedSettings.checkInCheckOut.sms,
      checkin_checkout_email: updatedSettings.checkInCheckOut.email,
      reviews_sms: updatedSettings.reviews.sms,
      reviews_email: updatedSettings.reviews.email,
      tips_insights_sms: updatedSettings.tipsMarketInsights.sms,
      tips_insights_email: updatedSettings.tipsMarketInsights.email,
      account_assistance_sms: updatedSettings.accountAccessAssistance.sms,
      account_assistance_email: updatedSettings.accountAccessAssistance.email,
      virtual_meetings_sms: updatedSettings.virtualMeetings.sms,
      virtual_meetings_email: updatedSettings.virtualMeetings.email,
    };

    // Use upsert to create or update the record
    const { error } = await supabase
      .from('notification_preferences')
      .upsert(dbData, { onConflict: 'user_id' });

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
