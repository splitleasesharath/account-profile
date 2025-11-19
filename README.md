# Account Profile Page

A standalone account profile page for Split Lease built with **React Islands architecture**, integrating shared Header and Footer components from the main Split Lease app, with Supabase for dynamic data.

## Architecture

This project follows the **ESM+React Islands** pattern as defined in the Split Lease architecture guide. React components are mounted to static HTML containers, creating "islands" of interactivity while maintaining fast page loads and SEO benefits.

## Features

### ✅ Pass 1: Basic Structure
- Clean, responsive HTML layout
- Professional CSS styling
- Profile header with photo placeholder
- Settings navigation links
- Verification section (Phone, Email, Identity, LinkedIn)
- Biography editor
- Listings display
- Blog articles section
- Mobile-responsive design (breakpoint at 800px)

### ✅ Pass 2: Supabase Integration
- URL path parsing to extract user ID
- Dynamic data fetching from Supabase
- User profile data display
- Host/Guest account support
- Listings fetching and display
- Profile completeness indicator
- Verification status updates
- Real-time biography saving

### ✅ Pass 3: Polish & Complete Functionality
- Toast notification system (success/error/info)
- Loading spinner with animation
- Profile photo upload functionality
- Reviews display
- Enhanced error handling
- Better loading states
- Guest account data support
- File validation (type and size)
- Responsive UI updates

## URL Formats

The page supports multiple URL formats for user ID:

1. **Path parameter**: `/account-profile/{user_id}`
2. **Query parameter**: `?userId={user_id}`
3. **Hash parameter**: `#{user_id}`

### Examples:
```
https://example.com/account-profile/1757672915442x990789031217136300
https://example.com/account-profile?userId=1757672915442x990789031217136300
file:///path/to/index.html#1757672915442x990789031217136300
```

## React Islands Integration

### Islands Mounted
1. **Header** (`/src/islands/shared/Header.jsx`) - Shared navigation component with auth
2. **Footer** (`/src/islands/shared/Footer.jsx`) - Shared footer with referral and import features

### Architecture Benefits
- **Code Reuse**: Header and Footer are shared across all Split Lease pages
- **Fast Load**: Static HTML loads first, React hydrates only interactive components
- **SEO Friendly**: Content visible before JavaScript execution
- **Easy Maintenance**: Changes to Header/Footer propagate to all pages

### How Islands Work
```html
<!-- Mount point in HTML -->
<div id="header-root"></div>

<!-- React hydration script -->
<script type="module">
  import { createRoot } from 'react-dom/client';
  import Header from '/src/islands/shared/Header.jsx';

  const headerRoot = document.getElementById('header-root');
  createRoot(headerRoot).render(<Header />);
</script>
```

## Project Structure

```
account-profile/
├── src/
│   ├── islands/              # React components
│   │   └── shared/          # Shared across pages
│   │       ├── Header.jsx   ✅ Integrated
│   │       └── Footer.jsx   ✅ Integrated
│   ├── lib/                 # Utilities
│   │   ├── auth.js         ✅ Authentication
│   │   ├── constants.js    ✅ App constants
│   │   └── supabase.js     ✅ DB client
│   └── styles/              # CSS files
│       ├── header.css      ✅ Header styles
│       └── footer.css      ✅ Footer styles
├── index.html              ✅ Main page with islands
├── package.json            ✅ ESM module config
├── vite.config.js          ✅ Vite build config
├── .env                    # Environment variables
└── README.md               # This file
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `react` and `react-dom` - React framework
- `@supabase/supabase-js` - Supabase client
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite

### 2. Environment Configuration

The `.env` file contains Supabase credentials:

```env
SUPABASE_URL=https://qcfifybkaddcoimjroca.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

**Note**: In the current implementation, credentials are embedded in the HTML for simplicity. For production, consider using environment variables.

### 2. Database Schema

The page queries the following Supabase tables:

- **user** - Main user profile data (109 columns)
  - `_id` (Primary Key)
  - `Name - Full`, `Name - First`, `Name - Last`
  - `email as text`, `Phone Number (as text)`
  - `Profile Photo`, `About Me / Bio`
  - `profile completeness`
  - `is email confirmed`, `Verify - Phone`, `user verified?`
  - `Account - Host / Landlord`, `Account - Guest`

- **account_host** - Host-specific data
  - `_id`, `User`, `AboutMe`, `Listings`

- **account_guest** - Guest-specific data
  - `_id`, `User`, `Email`, `Quick Message`

- **listing** - Property listings
  - Location, features, photos, pricing

- **mainreview** - User reviews
  - `Reviewer`, `Reviewee/Target`, `Overall Score`, `Comment`

### 3. Row Level Security (RLS)

Ensure your Supabase tables have appropriate RLS policies:

```sql
-- Example: Allow anonymous read access to user profiles
CREATE POLICY "Allow public read access to users"
ON user FOR SELECT
TO anon
USING (true);
```

## Usage

### Development Mode (Vite)

Start the Vite development server with hot module replacement:

```bash
npm run dev
```

This will:
- Start development server at `http://localhost:3000`
- Enable hot module replacement (HMR) for instant updates
- Automatically open your browser
- Compile React components on the fly

Access with a user ID:
```
http://localhost:3000#USER_ID
http://localhost:3000?userId=USER_ID
```

### Build for Production

Create optimized production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

### Legacy Method (Without Vite)

You can still open the file directly, but islands won't hydrate:
```bash
open index.html#YOUR_USER_ID
```

### Testing with Real Data

To test with a real user from the database:

1. Get a user ID from your Supabase database
2. Append it to the URL using any of the supported formats
3. The page will automatically fetch and display the user's data

## Features Detail

### Profile Header
- Displays user's full name
- Shows profile photo (or placeholder)
- Upload button for changing photo
- Profile completion percentage with visual progress circle

### Verification Section
- Phone verification status
- Email verification status
- Identity verification status
- LinkedIn verification status
- Shows verified/unverified state
- Hides "Verify" button for already verified items

### Biography
- Editable textarea
- Auto-populates from user's bio or host's AboutMe
- Save button updates database
- Success/error toast notifications

### Listings (Host Only)
- Displays all user's listings
- Shows property photos
- Location, bedrooms, bathrooms, guest capacity
- Proposals count badge
- Manage/Edit buttons for each listing

### Reviews
- Displays published reviews
- Shows reviewer name (or Anonymous)
- Star rating visualization
- Review comments

### Settings Links
- Payout Settings
- Notification Settings
- Change Password

## Technical Stack

- **Architecture**: React Islands (ESM modules)
- **Frontend Framework**: React 18.2 (islands only)
- **Build Tool**: Vite 5.0 with HMR
- **Module System**: ES Modules (strict .js/.jsx extensions)
- **Styling**: CSS3 (separate files for islands)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Bubble API + localStorage tokens
- **Storage**: Supabase Storage (for profile photos)
- **Package Manager**: npm

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

## Security Considerations

⚠️ **Important**: This implementation has NO authentication. Anyone with the user ID can view and edit the profile.

For production use, you should:

1. Implement user authentication
2. Add authorization checks (users can only edit their own profiles)
3. Set up proper RLS policies in Supabase
4. Use environment variables for credentials
5. Implement CSRF protection
6. Add input sanitization and validation

## File Structure

```
account-profile/
├── index.html          # Main page (all-in-one)
├── .env                # Supabase credentials
├── .env.example        # Template for credentials
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── input/              # Documentation context (ignored)
```

## Future Enhancements

- [ ] Add authentication (magic link, OAuth)
- [ ] Implement modals for settings
- [ ] Add inline editing for profile fields
- [ ] Real-time updates with Supabase subscriptions
- [ ] Image cropping/resizing before upload
- [ ] More comprehensive error handling
- [ ] Accessibility improvements (ARIA labels)
- [ ] Unit tests
- [ ] E2E tests with Playwright

## Known Limitations

1. **No Authentication**: Anyone can view/edit with the URL
2. **Single HTML File**: All code in one file (could be split)
3. **Embedded Credentials**: Supabase keys in HTML (use env vars in production)
4. **Limited Validation**: Client-side only (need server-side)
5. **Photo Storage**: Requires Supabase storage bucket setup
6. **Review Authors**: Currently shows "Anonymous" (needs reviewer lookup)

## Troubleshooting

### "No user ID found in URL"
- Make sure you're accessing the page with a user ID in the URL
- Check the console for URL parsing details
- Try using the hash format: `index.html#USER_ID`

### "User not found"
- Verify the user ID exists in your Supabase database
- Check RLS policies allow read access
- Look at browser console for specific error

### "Photo upload feature requires storage setup"
- Create a `profile-photos` bucket in Supabase Storage
- Set appropriate access policies
- Enable public access if needed

### Data not loading
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure database tables exist with correct names
- Check RLS policies

## ESM Module Guidelines

This project strictly follows ES Module standards as per the Split Lease architecture:

### ✅ Required Practices
```javascript
// ✅ CORRECT - Explicit extensions
import Header from './islands/shared/Header.jsx';
import { supabase } from './lib/supabase.js';
import { AUTH_STORAGE_KEYS } from './lib/constants.js';

// ❌ FORBIDDEN - No extensions
import Header from './islands/shared/Header';
import { supabase } from './lib/supabase';
```

### Import Order Convention
1. External packages (node_modules)
2. Internal components (.jsx files)
3. Internal utilities (.js files)

### No CommonJS
```javascript
// ❌ FORBIDDEN
const express = require('express');
module.exports = { Header };

// ✅ CORRECT
import express from 'express';
export default Header;
```

## Quick Start

```bash
# 1. Clone/navigate to directory
cd account-profile

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to
http://localhost:3000#USER_ID
```

## Contributing

This project uses the React Islands pattern. To modify:

1. **Islands**: Edit components in `/src/islands/shared/`
2. **Styles**: Update CSS in `/src/styles/`
3. **Utilities**: Modify `/src/lib/` files
4. **Page Layout**: Edit `index.html`
5. **Build Config**: Update `vite.config.js`

### Adding New Islands
```javascript
// 1. Create component: src/islands/shared/NewComponent.jsx
export default function NewComponent() {
  return <div>New Island</div>;
}

// 2. Add mount point in index.html
<div id="new-component-root"></div>

// 3. Add hydration script
<script type="module">
  import { createRoot } from 'react-dom/client';
  import NewComponent from '/src/islands/shared/NewComponent.jsx';

  const root = document.getElementById('new-component-root');
  createRoot(root).render(<NewComponent />);
</script>
```

## License

Proprietary - Split Lease

## Contact

For questions or issues, contact the Split Lease development team.
