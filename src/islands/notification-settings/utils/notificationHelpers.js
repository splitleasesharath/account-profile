// utils/notificationHelpers.js

export const getCategoryLabel = (key) => {
  const labels = {
    messageForwarding: 'Message Forwarding',
    paymentReminders: 'Payment Reminders',
    promotional: 'Promotional',
    reservationUpdates: 'Reservation Updates',
    leaseRequests: 'Lease Requests',
    proposalUpdates: 'Proposal Updates',
    checkInCheckOut: 'Check-in/Check-out Reminders',
    reviews: 'Reviews',
    tipsMarketInsights: 'Tips / Market Insights',
    accountAccessAssistance: 'Account Access Assistance',
    virtualMeetings: 'Virtual Meetings',
  };

  return labels[key] || key;
};
