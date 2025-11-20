import { createRoot } from 'react-dom/client';
import Header from './islands/shared/Header.jsx';
import Footer from './islands/shared/Footer.jsx';
import { NotificationSettingsIsland } from './islands/notification-settings/NotificationSettingsIsland.jsx';

// Mount Header island
const headerRoot = document.getElementById('header-root');
if (headerRoot) {
  createRoot(headerRoot).render(<Header />);
}

// Mount Footer island
const footerRoot = document.getElementById('footer-root');
if (footerRoot) {
  createRoot(footerRoot).render(<Footer />);
}

// Mount Notification Settings island
// This island listens for clicks on the "Notification Settings" button and opens a modal
const notificationRoot = document.createElement('div');
notificationRoot.id = 'notification-settings-root';
document.body.appendChild(notificationRoot);
createRoot(notificationRoot).render(<NotificationSettingsIsland />);
