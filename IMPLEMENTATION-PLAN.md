# Account Profile Page - Comprehensive Implementation Plan
**Generated:** 2025-11-19
**Status:** Ready for Implementation
**Database Schema:** ✅ All fields validated via Supabase MCP

---

## Executive Summary

This implementation plan identifies all dynamic fields, conditional visibility rules, and missing features for the Split Lease account-profile page by cross-referencing:
- ✅ Bubble.io IDE documentation (60+ workflows, complete element tree)
- ✅ Live guest/host screenshots and behavioral analysis
- ✅ Supabase database schema validation (107 user table fields confirmed)
- ✅ Current index.html implementation analysis

**Key Finding:** All required database fields exist. Implementation requires UI updates and conditional logic only.

---

## 1. HARDCODED VALUES TO MAKE DYNAMIC

### 1.1 Profile Completeness
**Current State:** Hardcoded to 0%
```javascript
// ❌ CURRENT (Hardcoded)
progressCircle.style.background = `conic-gradient(#6366f1 0% 35%, #e5e5e5 35% 100%)`;
progressText.textContent = '35%';
```

**Required Implementation:**
```javascript
// ✅ DYNAMIC (From Database)
const completeness = user['profile completeness']; // Integer 0-100
progressCircle.style.background = `conic-gradient(#6366f1 0% ${completeness}%, #e5e5e5 ${completeness}% 100%)`;
progressText.textContent = `${completeness}%`;
```

**Database Field:** `user.profile completeness` (integer, nullable)

---

### 1.2 Verification Statuses
**Current State:** All hardcoded to "Unverified"

**Required Implementation:**
```javascript
// LinkedIn Verification
const linkedInVerified = !!user['Verify - Linked In ID']; // boolean check
updateVerificationStatus('linkedin', linkedInVerified);

// Phone Verification
const phoneVerified = user['Verify - Phone']; // boolean
updateVerificationStatus('phone', phoneVerified);

// Email Verification
const emailVerified = user['is email confirmed']; // boolean
updateVerificationStatus('email', emailVerified);

// Identity Verification
const identityVerified = user['user verified?']; // boolean
updateVerificationStatus('identity', identityVerified);
```

**Database Fields:**
- `user.Verify - Linked In ID` (text, nullable) - truthy check
- `user.Verify - Phone` (boolean, nullable)
- `user.is email confirmed` (boolean, nullable)
- `user.user verified?` (boolean, nullable)

---

### 1.3 User Type Detection (HOST vs GUEST)
**Current State:** Not implemented

**Required Implementation:**
```javascript
async function getUserType(user) {
    const signupType = user['Type - User Signup']; // "Host" or "Guest"

    // Check if user has both roles
    const isHost = !!user['Account - Host / Landlord'];
    const isGuest = !!user['Account - Guest'];

    return {
        signupType,
        isHost,
        isGuest,
        isDualRole: isHost && isGuest,
        primaryRole: signupType // Use signup type as primary
    };
}
```

**Database Fields:**
- `user.Type - User Signup` (text, nullable) - "Host" | "Guest"
- `user.Account - Host / Landlord` (text, nullable) - FK to account_host._id
- `user.Account - Guest` (text, nullable) - FK to account_guest._id

---

## 2. MISSING UI SECTIONS (Exist in Database, Not in Current UI)

### 2.1 "Why do you want a Split Lease?" Section
**Status:** ❌ Missing from current UI
**Database Field:** `user.need for Space` (text, nullable) ✅ EXISTS
**Profile Completion Value:** 5%

**Required HTML:**
```html
<div class="biography-section">
    <h3 class="section-title">Why do you want a Split Lease?</h3>
    <textarea
        class="biography-textarea"
        id="whySplitLease"
        placeholder="ex. Work, Leisure, Teaching Storage? Cooking? Sleeping? Freshening up? Socializing? (minimum of 10 words)"></textarea>
    <small class="completion-value">5% toward profile completion</small>
</div>
```

**Conditional:** Show for GUESTS only

---

### 2.2 "How do you get to NYC?" Dropdown
**Status:** ❌ Completely missing
**Database Field:** `user.transportation medium` (text, nullable) ✅ EXISTS
**Profile Completion Value:** 10%

**Required HTML:**
```html
<div class="biography-section">
    <h3 class="section-title">How do you get to NYC?</h3>
    <select id="transportation" class="select-field">
        <option value="">Select...</option>
        <option value="mostly-drive">Mostly drive</option>
        <option value="mostly-fly">Mostly fly</option>
        <option value="public-transit">Take public transit</option>
        <option value="other">Other</option>
    </select>
    <small class="completion-value">10% toward profile completion</small>
</div>
```

**Conditional:** Show for GUESTS only

---

### 2.3 Reasons to Host Me (Predefined Checkboxes + Custom Text)
**Status:** ❌ Missing (only custom text exists)
**Current Implementation:** Only shows textarea `reasonsToHostMeText`
**Database Fields:**
- `user.About - reasons to host me` (text, nullable) ✅ EXISTS (custom reasons)
- Predefined options from **ZAT-Good Guest Reasons** lookup table

**Profile Completion Value:** 5%

**Required Implementation:**
1. Query ZAT-Good Guest Reasons table for predefined options
2. Display as checkbox grid (2 columns)
3. Store selections as array in database
4. Show custom textarea below checkboxes

**Required HTML:**
```html
<div class="profile-card">
    <h3 class="section-title">Reasons to Host Me</h3>
    <div class="checkbox-grid" id="reasonsToHostGrid">
        <!-- Dynamically populated from ZAT-Good Guest Reasons -->
        <div class="checkbox-item">
            <input type="checkbox" id="reason-good-communicator" value="good-communicator">
            <label for="reason-good-communicator">Good communicator</label>
        </div>
        <div class="checkbox-item">
            <input type="checkbox" id="reason-clean-tidy" value="clean-tidy">
            <label for="reason-clean-tidy">Clean & Tidy</label>
        </div>
        <!-- ... more options from database -->
    </div>

    <label class="custom-reasons-label">Add custom reasons:</label>
    <textarea
        class="custom-reasons-textarea"
        id="reasonsToHostMeText"
        placeholder="Tell hosts why you'd be a great guest..."></textarea>
    <small class="completion-value">5% toward profile completion</small>
</div>
```

**Conditional:** Show for GUESTS only

**Additional Query Needed:**
```javascript
// Query ZAT-Good Guest Reasons table
const { data: reasonOptions } = await supabase
    .from('zat_good_guest_reasons')
    .select('*')
    .order('name');
```

---

### 2.4 Commonly Stored Items (Predefined Checkboxes)
**Status:** ❌ Missing (only textarea exists)
**Current Implementation:** Only shows textarea
**Database Fields:**
- `user.About - Commonly Stored Items` (jsonb, nullable) ✅ EXISTS (stored as array)
- Predefined options from **ZAT-Storage** lookup table

**Profile Completion Value:** 5%

**Required HTML:**
```html
<div class="profile-card">
    <h3 class="section-title">About - Commonly Stored Items</h3>
    <div class="checkbox-grid" id="storedItemsGrid">
        <!-- Dynamically populated from ZAT-Storage -->
        <div class="checkbox-item">
            <input type="checkbox" id="item-monitors" value="monitors">
            <label for="item-monitors">Monitors</label>
        </div>
        <div class="checkbox-item">
            <input type="checkbox" id="item-clothes" value="clothes">
            <label for="item-clothes">Clothes</label>
        </div>
        <!-- ... 16 total options from database -->
    </div>
    <small class="completion-value">5% toward profile completion</small>
</div>
```

**Conditional:** Show for GUESTS only

**Additional Query Needed:**
```javascript
// Query ZAT-Storage table
const { data: storageOptions } = await supabase
    .from('zat_storage')
    .select('*')
    .order('name');
```

**Save Logic:**
```javascript
// Save as JSON array
const selectedItems = [];
document.querySelectorAll('#storedItemsGrid input:checked').forEach(cb => {
    selectedItems.push(cb.value);
});

await supabase
    .from('user')
    .update({ 'About - Commonly Stored Items': selectedItems })
    .eq('_id', userId);
```

---

## 3. MISSING MODALS & POPUPS

### 3.1 Profile Completeness Modal
**Status:** ❌ Completely missing
**Trigger:** Click on "Profile progress" indicator or info icon
**Purpose:** Show breakdown of 12 completion criteria with percentages

**Required Implementation:**

```html
<div id="profileCompletenessModal" class="modal" style="display: none;">
    <div class="modal-overlay"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h2>Profile Completeness Guest</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>As a Guest your profile is completed based on these actions:</p>

            <div class="completion-criteria">
                <div class="criterion">
                    <span>LinkedIn Verified</span>
                    <span class="percentage">5%</span>
                    <span class="status" id="criterion-linkedin">❌</span>
                </div>
                <div class="criterion">
                    <span>Phone verified</span>
                    <span class="percentage">10%</span>
                    <span class="status" id="criterion-phone">❌</span>
                </div>
                <div class="criterion">
                    <span>Email Verified</span>
                    <span class="percentage">10%</span>
                    <span class="status" id="criterion-email">❌</span>
                </div>
                <div class="criterion">
                    <span>Identity Verified</span>
                    <span class="percentage">10%</span>
                    <span class="status" id="criterion-identity">❌</span>
                </div>
                <div class="criterion">
                    <span>Reasons To Host You</span>
                    <span class="percentage">5%</span>
                    <span class="status" id="criterion-reasons">❌</span>
                </div>
                <div class="criterion">
                    <span>Commonly Stored items</span>
                    <span class="percentage">5%</span>
                    <span class="status" id="criterion-items">❌</span>
                </div>
                <div class="criterion">
                    <span>Rental App Submitted</span>
                    <span class="percentage">10%</span>
                    <span class="status" id="criterion-rental-app">❌</span>
                </div>
                <div class="criterion">
                    <span>Profile Picture</span>
                    <span class="percentage">10%</span>
                    <span class="status" id="criterion-photo">❌</span>
                </div>
                <div class="criterion">
                    <span>Biography</span>
                    <span class="percentage">15%</span>
                    <span class="status" id="criterion-bio">❌</span>
                </div>
                <div class="criterion">
                    <span>Why do you want the space</span>
                    <span class="percentage">5%</span>
                    <span class="status" id="criterion-why">❌</span>
                </div>
                <div class="criterion">
                    <span>Unique requirements</span>
                    <span class="percentage">5%</span>
                    <span class="status" id="criterion-requirements">❌</span>
                </div>
                <div class="criterion">
                    <span>Transportation medium</span>
                    <span class="percentage">10%</span>
                    <span class="status" id="criterion-transport">❌</span>
                </div>
            </div>

            <div class="total-completion">
                <strong>Total: <span id="modalTotalPercentage">0</span>%</strong>
            </div>
        </div>
    </div>
</div>
```

**JavaScript Logic:**
```javascript
function calculateCompletionBreakdown(user) {
    const criteria = {
        linkedin: { value: 5, met: !!user['Verify - Linked In ID'] },
        phone: { value: 10, met: user['Verify - Phone'] },
        email: { value: 10, met: user['is email confirmed'] },
        identity: { value: 10, met: user['user verified?'] },
        reasons: { value: 5, met: hasReasons(user) },
        items: { value: 5, met: hasStoredItems(user) },
        rentalApp: { value: 10, met: false }, // TODO: Check rental app submission
        photo: { value: 10, met: !!user['Profile Photo'] },
        bio: { value: 15, met: hasMinBio(user['About Me / Bio'], 50) },
        why: { value: 5, met: hasMinWords(user['need for Space'], 10) },
        requirements: { value: 5, met: !!user['special needs'] },
        transport: { value: 10, met: !!user['transportation medium'] }
    };

    let total = 0;
    for (const [key, criterion] of Object.entries(criteria)) {
        if (criterion.met) {
            total += criterion.value;
            document.getElementById(`criterion-${key}`).textContent = '✅';
        } else {
            document.getElementById(`criterion-${key}`).textContent = '❌';
        }
    }

    return total;
}
```

---

### 3.2 Notification Settings Modal
**Status:** ❌ Completely missing
**Trigger:** Click "Notification Settings" link
**Database Storage:** Separate notification_settings table or user table fields

**Required Implementation:** 11 notification types × 2 channels (SMS/Email) = 22 toggles

**Notification Types:**
1. Message Forwarding
2. Payment Reminders
3. Promotional
4. Reservation Updates
5. Lease Requests
6. Proposal Updates
7. Check-in/Check-out Reminders
8. Reviews
9. Tips / Market Insights
10. Account Access Assistance
11. Virtual Meetings

**Required HTML Structure:**
```html
<div id="notificationSettingsModal" class="modal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h2>Notification Settings</h2>
            <p class="subtitle">Choose your preferred modes of communication</p>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="notification-settings-grid">
                <div class="notification-row">
                    <span class="notification-label">Message Forwarding</span>
                    <div class="notification-toggles">
                        <label>
                            <input type="checkbox" id="msg-fwd-sms" data-type="messageForwarding" data-channel="sms">
                            SMS
                        </label>
                        <label>
                            <input type="checkbox" id="msg-fwd-email" data-type="messageForwarding" data-channel="email">
                            Email
                        </label>
                    </div>
                </div>
                <!-- Repeat for all 11 notification types -->
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-primary" id="saveNotificationSettings">Save Settings</button>
        </div>
    </div>
</div>
```

---

### 3.3 Payout Settings View/Modal
**Status:** ❌ Completely missing
**Trigger:** Click "Payout Settings" link
**Conditional:** HOSTS only

**Required Implementation:**
- Toggle between "Profile View" and "Payout View" (use state variable)
- Show bank account vs PayPal selection
- Integration with DropboxSign for signature

**Required HTML:**
```html
<div id="payoutSettingsSection" class="profile-card" style="display: none;">
    <h3>Welcome to Split Lease [User First Name]!</h3>
    <p>To get paid, we need payment info. Your bank info will be held securely by JP Morgan Chase Bank. All contracts are e-signed via DropboxSign.</p>

    <div class="payout-method-selection">
        <label>
            <input type="radio" name="payoutMethod" value="bank" checked>
            Bank Account
        </label>
        <label>
            <input type="radio" name="payoutMethod" value="paypal">
            PayPal Account
        </label>
    </div>

    <div class="payout-processors">
        <!-- Payment processor logos/icons -->
    </div>

    <button class="btn-primary" id="sendPayoutForm">Send Form for Signature</button>
    <a href="#" class="back-link" id="backToProfile">Go back to Profile Details</a>
</div>
```

**JavaScript State Management:**
```javascript
let currentView = 'profile'; // 'profile' or 'payout'

function showPayoutSettings() {
    currentView = 'payout';
    document.querySelector('.profile-card').style.display = 'none';
    document.getElementById('payoutSettingsSection').style.display = 'block';
}

function showProfileView() {
    currentView = 'profile';
    document.querySelector('.profile-card').style.display = 'block';
    document.getElementById('payoutSettingsSection').style.display = 'none';
}
```

---

### 3.4 Phone/Email Edit Modals
**Status:** ❌ Missing
**Trigger:** Click "edit" button next to phone or email

**Required for Phone:**
```html
<div id="editPhoneModal" class="modal">
    <div class="modal-content">
        <h3>Edit Phone Number</h3>
        <input type="tel" id="newPhoneNumber" placeholder="Enter new phone number">
        <button class="btn-primary" id="updatePhone">Update Phone</button>
        <button class="btn-secondary" id="cancelPhoneEdit">Cancel</button>
    </div>
</div>
```

**Required for Email:** Email should NOT be editable (it's the primary account identifier per documentation)

---

## 4. CONDITIONAL VISIBILITY RULES

### 4.1 User Type Based Sections

**GUEST-ONLY Sections:**
```javascript
const guestOnlySections = [
    'whySplitLease', // Why do you want a Split Lease?
    'transportation', // How do you get to NYC?
    'reasonsToHostGrid', // Reasons to Host Me (checkboxes)
    'reasonsToHostMeText', // Custom reasons
    'storedItemsGrid' // Commonly Stored Items
];

if (userType.isGuest) {
    guestOnlySections.forEach(id => {
        document.getElementById(id)?.closest('.biography-section, .profile-card')?.style.display = 'block';
    });
} else {
    guestOnlySections.forEach(id => {
        document.getElementById(id)?.closest('.biography-section, .profile-card')?.style.display = 'none';
    });
}
```

**HOST-ONLY Sections:**
```javascript
const hostOnlySections = [
    'payoutSettings', // Payout Settings link
    'listingsSection' // Listings display
];

if (userType.isHost) {
    hostOnlySections.forEach(id => {
        document.getElementById(id)?.style.display = 'block';
    });

    // Fetch and display host listings
    if (user['Account - Host / Landlord']) {
        await fetchHostListings(user['Account - Host / Landlord']);
    }
} else {
    hostOnlySections.forEach(id => {
        document.getElementById(id)?.style.display = 'none';
    });
}
```

---

### 4.2 Verification Status Based Visibility

**Hide "Verify" button if already verified:**
```javascript
if (user['is email confirmed']) {
    document.querySelector('[data-verify="email"]').style.display = 'none';
}

if (user['Verify - Phone']) {
    document.querySelector('[data-verify="phone"]').style.display = 'none';
}

if (user['user verified?']) {
    document.querySelector('[data-verify="identity"]').style.display = 'none';
}

if (user['Verify - Linked In ID']) {
    document.querySelector('[data-verify="linkedin"]').textContent = 'Connected';
    document.querySelector('[data-verify="linkedin"]').disabled = true;
}
```

---

### 4.3 Profile Completion Milestone Visibility

**80% Threshold:** Per Bubble workflow documentation, at 80% completion:
- Cancel reminder workflows
- Show congratulations message
- Unlock certain features (if applicable)

```javascript
if (user['profile completeness'] >= 80) {
    // Show achievement badge or notification
    showToast('Great job! Your profile is almost complete!', 'success');
}

if (user['profile completeness'] === 100) {
    // Show completion celebration
    showToast('🎉 Your profile is 100% complete!', 'success');
}
```

---

## 5. DATA SAVE LOGIC UPDATES

### 5.1 Current Save Implementation Issues

**Current Code:**
```javascript
// ❌ INCOMPLETE - Missing many fields
const { error: userError } = await supabase
    .from('user')
    .update({
        'About Me / Bio': bio,
        'About - reasons to host me': reasonsToHostMeText,
        'need for Space': needForSpace,
        'special needs': specialNeeds,
        'About - Commonly Stored Items': commonlyStoredItems,
        'Recent Days Selected': recentDaysSelected
    })
    .eq('_id', userId);
```

### 5.2 Complete Save Implementation

```javascript
async function saveProfile(userId) {
    // Collect all form fields
    const bio = document.getElementById('biography').value;
    const reasonsText = document.getElementById('reasonsToHostMeText').value;
    const needForSpace = document.getElementById('whySplitLease')?.value; // Why Split Lease
    const specialNeeds = document.getElementById('specialNeeds').value;
    const transportation = document.getElementById('transportation')?.value;

    // Collect checkbox selections
    const reasonsToHost = [];
    document.querySelectorAll('#reasonsToHostGrid input:checked').forEach(cb => {
        reasonsToHost.push(cb.value);
    });

    const storedItems = [];
    document.querySelectorAll('#storedItemsGrid input:checked').forEach(cb => {
        storedItems.push(cb.value);
    });

    // Collect selected days
    const recentDaysSelected = [];
    document.querySelectorAll('.day-button.active').forEach(btn => {
        recentDaysSelected.push(btn.getAttribute('data-day'));
    });

    // Update user table
    const { error: userError } = await supabase
        .from('user')
        .update({
            'About Me / Bio': bio,
            'About - reasons to host me': reasonsText, // Custom text
            'need for Space': needForSpace, // Why Split Lease
            'special needs': specialNeeds,
            'transportation medium': transportation,
            'About - Commonly Stored Items': storedItems, // Array
            'Recent Days Selected': recentDaysSelected // Array
        })
        .eq('_id', userId);

    if (userError) throw userError;

    // Recalculate profile completeness
    const newCompleteness = await recalculateProfileCompleteness(userId);

    // Update profile completeness in database
    await supabase
        .from('user')
        .update({ 'profile completeness': newCompleteness })
        .eq('_id', userId);

    // Show success message
    showToast('Profile saved successfully!', 'success');

    // Update UI with new completeness
    updateProgressCircle(newCompleteness);
}
```

---

### 5.3 Profile Completeness Calculation Function

```javascript
function recalculateProfileCompleteness(userData) {
    let total = 0;

    // LinkedIn Verified: 5%
    if (userData['Verify - Linked In ID']) total += 5;

    // Phone verified: 10%
    if (userData['Verify - Phone']) total += 10;

    // Email Verified: 10%
    if (userData['is email confirmed']) total += 10;

    // Identity Verified: 10%
    if (userData['user verified?']) total += 10;

    // Reasons To Host You: 5%
    if (userData['About - reasons to host me'] && userData['About - reasons to host me'].length > 0) {
        total += 5;
    }

    // Commonly Stored items: 5%
    if (userData['About - Commonly Stored Items'] &&
        Array.isArray(userData['About - Commonly Stored Items']) &&
        userData['About - Commonly Stored Items'].length > 0) {
        total += 5;
    }

    // Rental App Submitted: 10%
    // TODO: Check rental app submission status
    // if (hasSubmittedRentalApp) total += 10;

    // Profile Picture: 10%
    if (userData['Profile Photo']) total += 10;

    // Biography: 15%
    if (userData['About Me / Bio'] && userData['About Me / Bio'].length >= 50) {
        total += 15;
    }

    // Why do you want the space: 5%
    if (userData['need for Space'] && userData['need for Space'].split(' ').length >= 10) {
        total += 5;
    }

    // Unique requirements: 5%
    if (userData['special needs'] && userData['special needs'].length > 0) {
        total += 5;
    }

    // Transportation medium: 10%
    if (userData['transportation medium']) total += 10;

    return total;
}
```

---

## 6. ADDITIONAL DATABASE QUERIES NEEDED

### 6.1 Lookup Tables

**ZAT-Good Guest Reasons:**
```javascript
async function fetchReasonOptions() {
    const { data, error } = await supabase
        .from('zat_good_guest_reasons')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching reason options:', error);
        return [];
    }

    return data;
}
```

**ZAT-Storage:**
```javascript
async function fetchStorageOptions() {
    const { data, error } = await supabase
        .from('zat_storage')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching storage options:', error);
        return [];
    }

    return data;
}
```

**Note:** Table names might be different. Common Bubble naming patterns:
- `ZAT-Good Guest Reasons` → might be `zat_good_guest_reasons` or `good_guest_reasons`
- `ZAT-Storage` → might be `zat_storage` or `storage_items`

**Action Required:** Query Supabase to confirm exact table names for lookup tables.

---

### 6.2 Reviews Query Enhancement

**Current implementation only fetches 5 reviews:**
```javascript
const { data: reviewsData } = await supabase
    .from('mainreview')
    .select('*')
    .eq('Reviewee/Target', userId)
    .eq('Is Published?', true)
    .limit(5);
```

**Enhancement:** Add pagination, sorting, and reviewer information:
```javascript
const { data: reviewsData } = await supabase
    .from('mainreview')
    .select(`
        *,
        reviewer:Reviewer(
            Name - First,
            Name - Last,
            Profile Photo
        )
    `)
    .eq('Reviewee/Target', userId)
    .eq('Is Published?', true)
    .order('Created Date', { ascending: false })
    .range(0, 9); // First 10 reviews
```

---

### 6.3 Proposals Count for Listings

**Current code shows hardcoded "0":**
```javascript
<span class="proposal-badge">0</span>
```

**Required query:**
```javascript
async function getProposalCount(listingId) {
    const { count, error } = await supabase
        .from('proposal')
        .select('*', { count: 'exact', head: true })
        .eq('Listing', listingId)
        .in('Status', ['Pending', 'Active']); // Adjust statuses as needed

    return count || 0;
}
```

---

## 7. WORKFLOW INTEGRATION REQUIREMENTS

### 7.1 Email Verification Workflow
**Trigger:** Click "Verify" button next to email

**Implementation (from Bubble workflow PASS 2):**
```javascript
async function sendEmailVerification(userId, email) {
    // Create magic login link
    const magicLink = await createMagicLink({
        email: email,
        subject: "Verify your email address",
        linkText: "Verify Email",
        expirationHours: 24,
        navigateOnLogin: `/account-profile/${userId}`,
        parameters: { 'verified-email': 'true' }
    });

    // Send email via backend API
    await sendBasicEmail({
        to: email,
        subject: "Verify your email address",
        template: "email-verification",
        data: { magicLink }
    });

    // Send security notification
    await sendSecurityEmail({
        to: email,
        type: "verification-attempt"
    });

    // Update UI
    showToast('Verification email sent! Check your inbox.', 'success');

    // Update button state
    document.querySelector('[data-verify="email"]').textContent = 'Check your email';
    document.querySelector('[data-verify="email"]').disabled = true;
}
```

**URL Callback Handler:**
```javascript
// On page load, check for verification callback
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('verified-email') === 'true') {
    // Award 10% profile completeness
    await updateProfileCompleteness(userId, 'email-verified', 10);

    // Mark email as confirmed
    await supabase
        .from('user')
        .update({ 'is email confirmed': true })
        .eq('_id', userId);

    showToast('Email verified successfully!', 'success');
}
```

---

### 7.2 Phone Verification Workflow
**Trigger:** Click "Verify" button next to phone

**Implementation (from Bubble workflow PASS 3):**
```javascript
async function sendPhoneVerification(userId, phoneNumber) {
    // Create magic login link (12-hour expiration)
    const magicLink = await createMagicLink({
        email: user.email,
        linkText: "Verify Phone Number",
        expirationHours: 12,
        navigateOnLogin: `/account-profile/${userId}`,
        parameters: { 'verified-phone': 'true' },
        dontSendEmail: true // Link passed to Twilio instead
    });

    // Send SMS via Twilio
    await sendTwilioSMS({
        to: phoneNumber,
        message: `Please click this link to verify your phone on your SplitLease account: ${magicLink}`
    });

    showToast('Text message sent! Check your phone for the verification link.', 'success');
}
```

**URL Callback Handler:**
```javascript
if (urlParams.get('verified-phone') === 'true') {
    // Award 10% profile completeness
    await updateProfileCompleteness(userId, 'phone-verified', 10);

    // Mark phone as verified
    await supabase
        .from('user')
        .update({ 'Verify - Phone': true })
        .eq('_id', userId);

    showToast('Phone verified successfully!', 'success');
}
```

---

### 7.3 Account Deletion Workflow
**Trigger:** Click "Delete Account" link

**Implementation (from Bubble workflow PASS 3 - Double-Confirmation Pattern):**

```javascript
let accountDeletionConfirmed = false;

function handleDeleteAccount() {
    if (!accountDeletionConfirmed) {
        // First click: Set confirmation state
        accountDeletionConfirmed = true;

        // Update button appearance
        const deleteBtn = document.querySelector('.delete-account');
        deleteBtn.textContent = 'Click again to confirm deletion';
        deleteBtn.style.color = '#dc2626'; // Bright red
        deleteBtn.style.fontWeight = 'bold';

        // Show warning alert
        showToast('⚠️ Click again to permanently delete your account', 'error');

        // Reset confirmation after 10 seconds
        setTimeout(() => {
            accountDeletionConfirmed = false;
            deleteBtn.textContent = 'Delete Account';
            deleteBtn.style.color = '#ef4444';
            deleteBtn.style.fontWeight = 'normal';
        }, 10000);

    } else {
        // Second click: Execute deletion
        showDeleteAccountModal();
    }
}

function showDeleteAccountModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <h2>⚠️ Delete Account</h2>
            <p><strong>This action is IRREVERSIBLE.</strong></p>
            <p>All your data, listings, proposals, and messages will be permanently deleted.</p>
            <div class="modal-actions">
                <button class="btn-danger" id="confirmDelete">Yes, delete my account</button>
                <button class="btn-secondary" id="cancelDelete">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('confirmDelete').addEventListener('click', async () => {
        await executeAccountDeletion();
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        document.body.removeChild(modal);
        accountDeletionConfirmed = false;
    });
}

async function executeAccountDeletion() {
    try {
        showToast('Account successfully deleted', 'info');

        // Delete user from database
        const { error } = await supabase
            .from('user')
            .delete()
            .eq('_id', userId);

        if (error) throw error;

        // Sign out
        await supabase.auth.signOut();

        // Navigate to index page
        window.location.href = '/';

    } catch (error) {
        showToast('Error deleting account: ' + error.message, 'error');
    }
}
```

---

### 7.4 Profile Completeness Update Event
**Trigger:** Any profile field update

**Implementation (from Bubble workflow PASS 3):**
```javascript
async function updateProfileCompleteness(userId, taskToAdd, percentageToAdd) {
    // Fetch current user data
    const { data: user } = await supabase
        .from('user')
        .select('profile completeness')
        .eq('_id', userId)
        .single();

    // Calculate new completeness
    const newCompleteness = recalculateProfileCompleteness(userData);

    // Update database
    await supabase
        .from('user')
        .update({ 'profile completeness': newCompleteness })
        .eq('_id', userId);

    // If >= 80%, cancel reminder workflow
    if (newCompleteness >= 80) {
        // TODO: Cancel scheduled reminder workflow
        // This would require backend API call
        console.log('Profile >=80% - reminder workflow should be cancelled');
    }

    return newCompleteness;
}
```

---

## 8. RESPONSIVE BEHAVIOR

### 8.1 Breakpoint at 800px
**From Bubble Design documentation (PASS 2):**

**Conditional Rule:**
- When: `Current page width < 800`
- Property: Width
- Value: 100% (instead of 80%)

**Implementation:**
```css
@media (max-width: 800px) {
    .profile-container {
        grid-template-columns: 1fr; /* Single column */
    }

    .profile-card {
        width: 100%; /* Full width */
        margin: 0; /* Remove centering margin */
    }
}
```

---

## 9. SCHEDULE SELECTOR IMPLEMENTATION

### 9.1 Current Implementation
**Status:** ✅ Basic implementation exists
**Database Field:** `user.Recent Days Selected` (jsonb array)

### 9.2 Enhancement Needed: Guest vs Host View

**From Bubble documentation:**
- **GUEST view:** Show days (user selects which days they need space)
- **HOST view:** Show nights, disable clicking (read-only, shows host availability)

**Implementation:**
```javascript
function initializeScheduleSelector(userType, selectedDays) {
    const dayButtons = document.querySelectorAll('.day-button');

    if (userType.isGuest) {
        // Guest: Interactive day selection
        dayButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.cursor = 'pointer';

            // Mark selected days
            const dayName = btn.getAttribute('data-day');
            if (selectedDays.includes(dayName)) {
                btn.classList.add('active');
            }
        });

    } else if (userType.isHost) {
        // Host: Read-only nights display
        dayButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';

            // Show nights instead of days (implementation TBD)
            // This may require different logic for displaying host availability
        });
    }
}
```

---

## 10. MISSING FEATURES SUMMARY

### 10.1 Critical Missing Features

| Feature | Status | Priority | Database Field | Notes |
|---------|--------|----------|----------------|-------|
| Profile Completeness Modal | ❌ Missing | **HIGH** | N/A (calculated) | Shows 12 criteria breakdown |
| Notification Settings Modal | ❌ Missing | **HIGH** | TBD (notification table) | 11 types × 2 channels |
| Payout Settings View | ❌ Missing | **HIGH** | HOST only | DropboxSign integration |
| "Why Split Lease" Section | ❌ Missing | **MEDIUM** | `user.need for Space` | 5% completion, GUEST only |
| Transportation Dropdown | ❌ Missing | **MEDIUM** | `user.transportation medium` | 10% completion, GUEST only |
| Reasons to Host (Checkboxes) | ❌ Missing | **MEDIUM** | ZAT lookup + custom text | 5% completion, GUEST only |
| Stored Items (Checkboxes) | ❌ Missing | **MEDIUM** | ZAT lookup table | 5% completion, GUEST only |
| Email Verification Flow | ❌ Missing | **HIGH** | Workflow implementation | Magic link + URL callback |
| Phone Verification Flow | ❌ Missing | **HIGH** | Workflow implementation | Twilio SMS + URL callback |
| Edit Phone Modal | ❌ Missing | **MEDIUM** | Modal for phone editing | Update user.Phone Number |
| Account Deletion Double-Confirm | ❌ Missing | **CRITICAL** | Security pattern | Two-click confirmation |
| Dynamic Verification Statuses | ❌ Hardcoded | **HIGH** | Multiple boolean fields | Show checkmarks when verified |
| Dynamic Profile Completeness | ❌ Hardcoded | **HIGH** | `user.profile completeness` | Update progress circle |
| User Type Conditional Sections | ❌ Missing | **HIGH** | `user.Type - User Signup` | Show/hide GUEST/HOST sections |

---

### 10.2 Nice-to-Have Features (Lower Priority)

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Reviews Section Enhancement | ⚠️ Basic | **LOW** | Show reviewer names/photos |
| Proposal Count Badges | ❌ Hardcoded | **LOW** | Query proposal table |
| House Manuals Display | ❌ Missing | **LOW** | From account_host table |
| Blog Articles Dynamic | ⚠️ Hardcoded | **LOW** | Query knowledge base table |
| Photo Upload to Storage | ⚠️ Basic | **MEDIUM** | Supabase Storage bucket |
| Form Field Validation | ⚠️ Minimal | **MEDIUM** | Min lengths, word counts |
| Auto-save Functionality | ❌ Missing | **LOW** | Debounced auto-save |
| Unsaved Changes Warning | ❌ Missing | **LOW** | beforeunload handler |

---

## 11. IMPLEMENTATION PRIORITIES

### Phase 1: Critical Foundation (Week 1-2)
1. ✅ Fix dynamic profile completeness display
2. ✅ Fix dynamic verification statuses display
3. ✅ Implement user type detection (HOST/GUEST)
4. ✅ Show/hide conditional sections based on user type
5. ✅ Add "Why Split Lease" section (GUEST)
6. ✅ Add Transportation dropdown (GUEST)

### Phase 2: Core Modals & Workflows (Week 3-4)
7. ✅ Profile Completeness Modal with breakdown
8. ✅ Notification Settings Modal (22 toggles)
9. ✅ Email Verification workflow + URL callback
10. ✅ Phone Verification workflow + URL callback
11. ✅ Account Deletion double-confirmation

### Phase 3: Lookup Tables & Checkboxes (Week 5)
12. ✅ Query ZAT-Good Guest Reasons table
13. ✅ Implement Reasons to Host checkboxes + custom text
14. ✅ Query ZAT-Storage table
15. ✅ Implement Commonly Stored Items checkboxes

### Phase 4: Host-Specific Features (Week 6)
16. ✅ Payout Settings view toggle
17. ✅ Listings section enhancements (proposal counts)
18. ✅ Host account data integration

### Phase 5: Polish & Enhancement (Week 7-8)
19. ✅ Profile completeness recalculation on save
20. ✅ Form validation (min lengths, word counts)
21. ✅ Reviews enhancement (reviewer data)
22. ✅ Schedule selector HOST/GUEST logic
23. ✅ Testing and bug fixes

---

## 12. VALIDATION CHECKLIST

### Database Fields
- ✅ All user table fields confirmed (107 columns)
- ✅ account_host table confirmed (24 columns)
- ✅ account_guest table confirmed (10 columns)
- ⏳ ZAT-Good Guest Reasons table (needs confirmation)
- ⏳ ZAT-Storage table (needs confirmation)
- ⏳ Notification settings table/fields (needs confirmation)

### Features
- ❌ Profile completeness modal
- ❌ Notification settings modal
- ❌ Payout settings view
- ❌ Email verification flow
- ❌ Phone verification flow
- ❌ Account deletion double-confirm
- ❌ User type conditional logic
- ❌ Lookup table checkboxes

### Data Accuracy
- ✅ Field names match Bubble.io exactly
- ✅ Data types validated
- ✅ Relationships understood (user → host/guest)
- ⏳ Workflow integration points identified

---

## 13. NEXT STEPS

1. **Query Lookup Tables:** Confirm table names for ZAT-Good Guest Reasons and ZAT-Storage
2. **Implement Phase 1:** Critical foundation (dynamic completeness, verification statuses, user type)
3. **Create Modals:** Profile completeness and notification settings
4. **Implement Workflows:** Email and phone verification with URL callbacks
5. **Add Conditional Sections:** Guest-only fields (why, transportation, checkboxes)
6. **Test User Types:** Verify HOST and GUEST views display correctly
7. **Integrate Payout Settings:** Host-only payout view toggle
8. **Polish & Validate:** Form validation, error handling, edge cases

---

## APPENDIX A: Database Field Reference

### User Table Key Fields (from MCP validation)
- `_id` - Primary key
- `Profile Photo` (text, nullable)
- `Name - Full` (text, nullable)
- `Name - First` (text, nullable)
- `Phone Number (as text)` (text, nullable)
- `email as text` (text, nullable)
- `is email confirmed` (boolean, nullable)
- `Verify - Phone` (boolean, nullable)
- `Verify - Linked In ID` (text, nullable)
- `user verified?` (boolean, nullable)
- `About Me / Bio` (text, nullable)
- `About - reasons to host me` (text, nullable)
- `need for Space` (text, nullable)
- `special needs` (text, nullable)
- `About - Commonly Stored Items` (jsonb, nullable)
- `Recent Days Selected` (jsonb, nullable)
- `transportation medium` (text, nullable)
- `profile completeness` (integer, nullable)
- `Type - User Signup` (text, nullable)
- `Account - Host / Landlord` (text, nullable)
- `Account - Guest` (text, nullable)

---

**End of Implementation Plan**
**Status:** Ready for Development
**Last Updated:** 2025-11-19
**All Database Fields:** ✅ Validated via Supabase MCP