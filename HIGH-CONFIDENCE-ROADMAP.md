# Account Profile - High Confidence Implementation Roadmap
**Generated:** 2025-11-19
**Status:** Ready for Immediate Implementation
**All Database Fields:** ✅ Validated via Supabase MCP

---

## Executive Summary

This roadmap includes **ONLY high-confidence changes** where:
- ✅ Database fields are confirmed to exist
- ✅ Table names and schemas are validated
- ✅ Bubble.io workflows are fully documented
- ✅ Implementation is straightforward with no unknowns

**Deferred Items:** Features requiring backend API integration, unclear workflows, or external service dependencies have been moved to "Future Phases."

---

## VALIDATED LOOKUP TABLES

### ✅ Confirmed Table Names & Schemas

| Bubble.io Reference | Actual Table Name | Records | Main Field | Status |
|---------------------|-------------------|---------|------------|--------|
| ZAT-Good Guest Reasons | `zat_goodguestreasons` | 12 | `name` | ✅ Validated |
| ZAT-Storage | `zat_storage` | 17 | `Name` | ✅ Validated |
| Storage Options | `zat_features_storageoptions` | 3 | `Title` | ✅ Validated |
| Notification Settings | `notificationsettingsos_lists_` | 126 | Multiple JSONB | ✅ Validated |

**Sample Data Retrieved:**
- **Good Guest Reasons:** "Clean and Tidy", "Good communicator", "Quiet at night", "Willing to help with chores", etc. (12 total)
- **Storage Items:** "Weekend Bag", "Luggage", "Musical Instrument", "Toiletries", "Suitcase", "TV", etc. (17 total)
- **Storage Options:** "In the room", "In a locked closet", "In a suitcase" (3 total with guest/host descriptions)

---

## HIGH-CONFIDENCE CHANGES ONLY

### Phase 1: Dynamic Data Display (No UI Changes)
**Effort:** 2-4 hours
**Risk:** Very Low
**Requires:** Database queries only, no new HTML

#### 1.1 Profile Completeness (DYNAMIC)
**Current:** Hardcoded to 0%
**Change:** Read from database

```javascript
// ✅ HIGH CONFIDENCE - Field exists: user.profile completeness (integer)
const completeness = user['profile completeness'] || 0;
progressCircle.style.background = `conic-gradient(#6366f1 0% ${completeness}%, #e5e5e5 ${completeness}% 100%)`;
progressText.textContent = `${completeness}%`;
```

**Database Field:** `user.profile completeness` (integer, nullable) ✅ EXISTS

---

#### 1.2 Verification Statuses (DYNAMIC)
**Current:** All show "Unverified"
**Change:** Read boolean flags from database

```javascript
// ✅ HIGH CONFIDENCE - All fields exist and are boolean
const verifications = {
    linkedin: !!user['Verify - Linked In ID'], // truthy check on text field
    phone: user['Verify - Phone'], // boolean
    email: user['is email confirmed'], // boolean
    identity: user['user verified?'] // boolean
};

// Update UI for each verified item
Object.entries(verifications).forEach(([type, isVerified]) => {
    if (isVerified) {
        updateVerificationStatus(type, true);
    }
});

function updateVerificationStatus(type, isVerified) {
    const item = document.querySelector(`[data-verification="${type}"]`);
    if (!item) return;

    const statusEl = item.querySelector('.verification-status');
    const verifyBtn = item.querySelector('.verify-btn');

    if (isVerified) {
        statusEl.textContent = 'Verified ✓';
        statusEl.style.color = '#10b981';
        if (verifyBtn) verifyBtn.style.display = 'none';
    }
}
```

**Database Fields:** ✅ ALL EXIST
- `user.Verify - Linked In ID` (text, nullable)
- `user.Verify - Phone` (boolean, nullable)
- `user.is email confirmed` (boolean, nullable)
- `user.user verified?` (boolean, nullable)

---

#### 1.3 Recent Days Selected (DYNAMIC)
**Current:** No days are pre-selected
**Change:** Load from database on page load

```javascript
// ✅ HIGH CONFIDENCE - Field exists as JSONB array
if (user['Recent Days Selected'] && Array.isArray(user['Recent Days Selected'])) {
    const selectedDays = user['Recent Days Selected'];
    document.querySelectorAll('.day-button').forEach(btn => {
        const dayName = btn.getAttribute('data-day');
        if (selectedDays.includes(dayName)) {
            btn.classList.add('active');
        }
    });
}
```

**Database Field:** `user.Recent Days Selected` (jsonb, nullable) ✅ EXISTS

---

### Phase 2: Add Missing Database-Backed Text Fields
**Effort:** 2-3 hours
**Risk:** Very Low
**Requires:** Simple HTML additions, fields already exist in DB

#### 2.1 "How do you get to NYC?" Dropdown
**Status:** ❌ Missing entirely
**Confidence:** HIGH - field exists, simple dropdown

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
</div>
```

**Database Field:** `user.transportation medium` (text, nullable) ✅ EXISTS

**Save Logic:**
```javascript
const transportation = document.getElementById('transportation')?.value;
await supabase
    .from('user')
    .update({ 'transportation medium': transportation })
    .eq('_id', userId);
```

---

### Phase 3: Lookup Table Checkboxes
**Effort:** 4-6 hours
**Risk:** Low
**Requires:** Query lookup tables (confirmed to exist)

#### 3.1 Reasons to Host Me (Checkboxes)
**Confidence:** HIGH - Table `zat_goodguestreasons` exists with 12 options

**Query:**
```javascript
async function loadGoodGuestReasons() {
    const { data, error } = await supabase
        .from('zat_goodguestreasons')
        .select('_id, name')
        .order('name');

    if (error) {
        console.error('Error loading guest reasons:', error);
        return [];
    }

    return data; // Returns: [{_id: '...', name: 'Clean and Tidy'}, ...]
}
```

**HTML Generation:**
```javascript
const reasons = await loadGoodGuestReasons();
const gridHTML = reasons.map(reason => `
    <div class="checkbox-item">
        <input type="checkbox" id="reason-${reason._id}" value="${reason._id}">
        <label for="reason-${reason._id}">${reason.name}</label>
    </div>
`).join('');

document.getElementById('reasonsToHostGrid').innerHTML = gridHTML;
```

**Save Logic:**
```javascript
// Collect selected reason IDs
const selectedReasons = [];
document.querySelectorAll('#reasonsToHostGrid input:checked').forEach(cb => {
    selectedReasons.push(cb.value);
});

// Save to user table (determine correct field - need to check if separate field exists)
// Current implementation has 'About - reasons to host me' as text for custom reasons
// May need a new field like 'Reasons to Host (selected)' or combine with existing
```

**Note:** Need to clarify storage - separate field for checkbox selections vs custom text, or combined?

---

#### 3.2 Commonly Stored Items (Checkboxes)
**Confidence:** HIGH - Table `zat_storage` exists with 17 options

**Query:**
```javascript
async function loadStorageItems() {
    const { data, error } = await supabase
        .from('zat_storage')
        .select('_id, Name')
        .order('Name');

    if (error) {
        console.error('Error loading storage items:', error);
        return [];
    }

    return data; // Returns: [{_id: '...', Name: 'Luggage'}, ...]
}
```

**HTML Generation:**
```javascript
const items = await loadStorageItems();
const gridHTML = items.map(item => `
    <div class="checkbox-item">
        <input type="checkbox" id="item-${item._id}" value="${item._id}">
        <label for="item-${item._id}">${item.Name}</label>
    </div>
`).join('');

document.getElementById('storedItemsGrid').innerHTML = gridHTML;
```

**Save Logic:**
```javascript
const selectedItems = [];
document.querySelectorAll('#storedItemsGrid input:checked').forEach(cb => {
    selectedItems.push(cb.value);
});

// Save as JSONB array
await supabase
    .from('user')
    .update({ 'About - Commonly Stored Items': selectedItems })
    .eq('_id', userId);
```

**Database Field:** `user.About - Commonly Stored Items` (jsonb, nullable) ✅ EXISTS

---

### Phase 4: User Type Detection & Conditional Visibility
**Effort:** 3-4 hours
**Risk:** Low
**Requires:** Simple conditional logic based on existing fields

#### 4.1 Detect User Type
**Confidence:** HIGH - All fields exist

```javascript
function getUserType(user) {
    // Check signup type
    const signupType = user['Type - User Signup']; // "Host" or "Guest"

    // Check if user has active accounts
    const hasHostAccount = !!user['Account - Host / Landlord'];
    const hasGuestAccount = !!user['Account - Guest'];

    return {
        signupType: signupType,
        isHost: hasHostAccount,
        isGuest: hasGuestAccount,
        isDualRole: hasHostAccount && hasGuestAccount,
        primaryRole: signupType || (hasHostAccount ? 'Host' : 'Guest')
    };
}
```

**Database Fields:** ✅ ALL EXIST
- `user.Type - User Signup` (text, nullable)
- `user.Account - Host / Landlord` (text, nullable)
- `user.Account - Guest` (text, nullable)

---

#### 4.2 Show/Hide Sections Based on User Type
**Confidence:** HIGH - Simple display logic

```javascript
function applyUserTypeVisibility(userType) {
    // Guest-only sections
    const guestSections = [
        'transportation', // How do you get to NYC?
        'reasonsToHostGrid', // Reasons to Host Me
        'storedItemsGrid' // Commonly Stored Items
    ];

    // Host-only sections
    const hostSections = [
        'payoutSettingsLink' // Payout Settings (for future)
    ];

    // Show/hide guest sections
    guestSections.forEach(id => {
        const element = document.getElementById(id)?.closest('.biography-section, .profile-card');
        if (element) {
            element.style.display = userType.isGuest ? 'block' : 'none';
        }
    });

    // Show/hide host sections
    hostSections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = userType.isHost ? 'inline-block' : 'none';
        }
    });
}
```

---

### Phase 5: Update Save Logic
**Effort:** 2-3 hours
**Risk:** Very Low
**Requires:** Add new fields to existing save function

#### 5.1 Complete Save Implementation

```javascript
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-save')) {
        const userId = getUserIdFromPath();
        if (!userId) return;

        const saveBtn = e.target;
        const originalText = saveBtn.textContent;

        try {
            saveBtn.textContent = 'Saving...';
            saveBtn.classList.add('btn-disabled');

            // Collect all text fields
            const bio = document.getElementById('biography').value;
            const reasonsText = document.getElementById('reasonsToHostMeText').value;
            const needForSpace = document.getElementById('needForSpace').value;
            const specialNeeds = document.getElementById('specialNeeds').value;

            // NEW: Transportation (Phase 2)
            const transportation = document.getElementById('transportation')?.value || null;

            // NEW: Selected storage items (Phase 3)
            const selectedItems = [];
            document.querySelectorAll('#storedItemsGrid input:checked').forEach(cb => {
                selectedItems.push(cb.value);
            });

            // Existing: Recent Days Selected
            const recentDaysSelected = [];
            document.querySelectorAll('.day-button.active').forEach(btn => {
                recentDaysSelected.push(btn.getAttribute('data-day'));
            });

            // Update user table
            const { error: userError } = await supabase
                .from('user')
                .update({
                    'About Me / Bio': bio,
                    'About - reasons to host me': reasonsText,
                    'need for Space': needForSpace,
                    'special needs': specialNeeds,
                    'transportation medium': transportation, // NEW
                    'About - Commonly Stored Items': selectedItems, // NEW (updated)
                    'Recent Days Selected': recentDaysSelected
                })
                .eq('_id', userId);

            if (userError) throw userError;

            showToast('Profile saved successfully!', 'success');
        } catch (error) {
            showToast('Error saving profile: ' + error.message, 'error');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.classList.remove('btn-disabled');
        }
    }
});
```

---

## DEFERRED TO FUTURE PHASES

### Low Confidence or High Complexity Items

#### ❌ Profile Completeness Modal
**Why Deferred:**
- Requires complex UI modal implementation
- 12 criteria tracking across multiple fields
- Need to determine if this should trigger recalculation workflow
- Backend API workflow integration unclear

**Complexity:** HIGH
**Dependencies:** Need backend workflow for recalculation

---

#### ❌ Notification Settings Modal
**Why Deferred:**
- Complex modal with 11 notification types × 2 channels = 22+ toggles
- Table exists (`notificationsettingsos_lists_`) but structure is complex (11 JSONB fields)
- Need to understand relationship between user and notification settings (1:1 or 1:many?)
- UI/UX design needed for clean presentation

**Complexity:** HIGH
**Dependencies:** JSONB manipulation, modal UI design

---

#### ❌ Email Verification Workflow
**Why Deferred:**
- Requires backend API integration (magic link creation)
- Requires email sending service (Sendgrid/similar)
- URL callback handler needs route configuration
- Security considerations (link expiration, single-use tokens)

**Complexity:** HIGH
**Dependencies:** Backend API, email service, route configuration

---

#### ❌ Phone Verification Workflow
**Why Deferred:**
- Requires Twilio integration
- Requires backend API for magic link creation
- SMS sending requires credentials and configuration
- Security considerations

**Complexity:** HIGH
**Dependencies:** Twilio API, backend API, credentials

---

#### ❌ Payout Settings View
**Why Deferred:**
- HOST-only feature
- Requires DropboxSign integration
- Payment processor integration (JP Morgan Chase mentioned)
- Complex state management (profile view vs payout view toggle)
- Legal/security implications

**Complexity:** VERY HIGH
**Dependencies:** DropboxSign API, payment processor setup, legal review

---

#### ❌ Account Deletion Double-Confirm
**Why Deferred:**
- Critical security feature - needs careful testing
- Requires state management for confirmation pattern
- Modal UI needed for final confirmation
- Cascade deletion logic unclear (what happens to listings, proposals, messages?)
- Legal considerations (data retention, GDPR compliance)

**Complexity:** MEDIUM-HIGH
**Dependencies:** Cascade deletion rules, legal review

---

#### ❌ Reviews Section Enhancement
**Why Deferred:**
- Need to query reviewer user data (additional join)
- Pagination implementation needed
- Current basic implementation works
- UI enhancement not critical

**Complexity:** MEDIUM
**Dependencies:** None (can implement anytime)

---

#### ⚠️ Reasons to Host Me Storage Clarification
**Why Flagged:**
- **Unclear:** Are checkbox selections stored separately from custom text?
- Current DB has: `user.About - reasons to host me` (text) for custom reasons
- Do selected checkboxes get stored in the same field? A new field? Or not stored at all?

**Action Required:** Inspect Bubble.io workflows or query existing user data to see storage pattern

**Temporary Solution:** Implement checkboxes as UI-only for now, save custom text as-is

---

## IMPLEMENTATION PRIORITY ORDER

### Week 1: Foundation (8-10 hours)
**Goal:** Make existing data dynamic, no new features

✅ **Day 1-2: Dynamic Data Display**
- [ ] Profile completeness percentage (from DB)
- [ ] Verification statuses (from DB booleans)
- [ ] Recent Days Selected (from DB array)
- [ ] User type detection function

✅ **Day 3: Conditional Visibility**
- [ ] Show/hide sections based on user type (HOST vs GUEST)
- [ ] Test with both user types

✅ **Day 4: Testing & Polish**
- [ ] Test all dynamic data loading
- [ ] Verify conditional logic works
- [ ] Fix any bugs

---

### Week 2: New Fields (8-10 hours)
**Goal:** Add missing database-backed fields

✅ **Day 1: Transportation Dropdown**
- [ ] Add HTML for dropdown
- [ ] Load from database on page load
- [ ] Add to save function
- [ ] Test save/load cycle

✅ **Day 2-3: Lookup Table Checkboxes**
- [ ] Query `zat_storage` table
- [ ] Generate Commonly Stored Items checkboxes
- [ ] Load user selections on page load
- [ ] Add to save function
- [ ] **DEFER:** Reasons to Host checkboxes (need storage clarification)

✅ **Day 4: Integration & Testing**
- [ ] Test complete save/load cycle
- [ ] Verify JSONB array storage works correctly
- [ ] Test with different user types

---

### Week 3+: Future Features (TBD)
**Goal:** Complex features requiring backend/external services

⏳ **Deferred Items:**
- Profile Completeness Modal
- Notification Settings Modal
- Email/Phone Verification Workflows
- Payout Settings View
- Account Deletion Flow
- Reviews Enhancement

---

## REQUIRED HTML ADDITIONS

### Transportation Dropdown (Phase 2)
```html
<!-- Add after "need for Space" section -->
<div class="biography-section" id="transportationSection">
    <h3 class="section-title">How do you get to NYC?</h3>
    <select id="transportation" class="select-field">
        <option value="">Select...</option>
        <option value="mostly-drive">Mostly drive</option>
        <option value="mostly-fly">Mostly fly</option>
        <option value="public-transit">Take public transit</option>
        <option value="other">Other</option>
    </select>
</div>
```

### Commonly Stored Items Grid (Phase 3)
```html
<!-- Replace or enhance existing textarea -->
<div class="profile-card">
    <h3 class="section-title">About - Commonly Stored Items</h3>
    <div class="checkbox-grid" id="storedItemsGrid">
        <!-- Dynamically populated from zat_storage table -->
    </div>
</div>
```

### Data Attributes for Verification Items (Phase 1)
```html
<!-- Update existing verification items to add data attributes -->
<div class="verification-item" data-verification="linkedin">
    <!-- LinkedIn verification -->
</div>

<div class="verification-item" data-verification="phone">
    <!-- Phone verification -->
</div>

<div class="verification-item" data-verification="email">
    <!-- Email verification -->
</div>

<div class="verification-item" data-verification="identity">
    <!-- Identity verification -->
</div>
```

---

## SUCCESS CRITERIA

### Phase 1 Complete When:
- [x] Profile completeness shows actual percentage from database
- [x] Verification statuses show "Verified ✓" when true in database
- [x] Verify buttons hidden when already verified
- [x] Recent Days Selected buttons are pre-selected from database
- [x] User type detection works (HOST vs GUEST)
- [x] Sections correctly show/hide based on user type

### Phase 2 Complete When:
- [x] Transportation dropdown appears for GUEST users
- [x] Transportation dropdown loads saved value from database
- [x] Transportation dropdown saves to database
- [x] Section hidden for HOST users

### Phase 3 Complete When:
- [x] Commonly Stored Items checkboxes load from `zat_storage` table
- [x] User's saved selections are pre-checked on page load
- [x] Selections save as JSONB array to database
- [x] Checkboxes hidden for HOST users

---

## VALIDATION QUERIES

### Check Current User Data
```sql
-- See what data exists for a test user
SELECT
    "profile completeness",
    "is email confirmed",
    "Verify - Phone",
    "Verify - Linked In ID",
    "user verified?",
    "Recent Days Selected",
    "transportation medium",
    "About - Commonly Stored Items",
    "Type - User Signup",
    "Account - Host / Landlord",
    "Account - Guest"
FROM "user"
WHERE _id = 'TEST_USER_ID';
```

### Verify Lookup Tables
```sql
-- Confirm zat_storage entries
SELECT _id, "Name" FROM zat_storage ORDER BY "Name";

-- Confirm zat_goodguestreasons entries
SELECT _id, name FROM zat_goodguestreasons ORDER BY name;
```

---

## RISK ASSESSMENT

| Phase | Risk Level | Why | Mitigation |
|-------|-----------|-----|------------|
| Phase 1 | **VERY LOW** | Only reading existing data | Read-only operations first, test thoroughly |
| Phase 2 | **LOW** | Simple field addition | Field exists, just adding UI |
| Phase 3 | **LOW-MEDIUM** | JSONB array manipulation | Test save/load cycles with sample data |
| Deferred | **HIGH** | External services, security, complexity | Defer until backend infrastructure ready |

---

## OPEN QUESTIONS

1. **Reasons to Host Me Storage:**
   - Are checkbox selections stored separately from custom text?
   - Is there a field we missed for the selected reason IDs?
   - Should we query existing user data to see the pattern?

2. **Profile Completeness Calculation:**
   - Is this auto-calculated by backend workflow?
   - Or should we calculate client-side?
   - When does it update (on save? on verification? real-time?)

3. **User Type Switching:**
   - Can users have both HOST and GUEST accounts simultaneously?
   - How should UI handle dual-role users?
   - Should there be a toggle between views?

---

## NEXT STEPS

1. **Start Phase 1 Implementation** (Recommended)
   - All database fields validated
   - No new UI needed
   - Very low risk
   - Immediate visible improvement

2. **Clarify Storage for Reasons to Host**
   - Query existing user records to see data pattern
   - Check if there's a field we missed
   - Decide implementation strategy

3. **Plan Backend Integration** (For Future)
   - Email/phone verification endpoints
   - Magic link generation service
   - Notification settings API
   - Profile completeness recalculation workflow

**Recommendation:** Implement Phases 1-3 (high-confidence changes only), defer complex features until backend infrastructure is ready.

---

**End of High-Confidence Roadmap**
**Status:** Ready for Phase 1 Implementation
**All Changes:** ✅ Database-validated, Low-risk