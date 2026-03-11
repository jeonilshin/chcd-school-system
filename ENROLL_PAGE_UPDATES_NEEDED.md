# Enroll Page Updates Needed

The `/enroll` page (`src/app/enroll/page.tsx`) has a custom multi-step enrollment flow that needs to be updated to match the improvements made to the `EnrollmentForm` component.

## Current Status

✅ **Completed:**
- Child contact number "Not Available" checkbox (line ~1238)
- `hasContactNumber` field added to personalInfo state

❌ **Still Needed:**

### 1. Parent Information Section (Step 3 - parentInfo)
**Location:** Lines ~1365-1550

**Required Changes:**
- Add parent availability selection at the top (Both Parents / Father Only / Mother Only / Single Parent)
- Add state variables for showing/hiding parent sections
- Father's Contact Number: Add "Not Available" checkbox
- Father's Email: Add "No Email" checkbox  
- Mother's Contact Number: Add "Not Available" checkbox
- Mother's Email: Change from required (*) to optional with "No Email" checkbox
- Conditionally show/hide father/mother sections based on availability selection

### 2. Old Student Parent Information (Step - oldStudentForm)
**Location:** Lines ~1750-1850

**Required Changes:**
- Same as above for old student flow
- Add parent availability selection
- Add checkboxes for contact numbers and emails

### 3. Sibling Information Section
**Location:** Lines ~1520-1550 (in parentInfo step)

**Required Changes:**
- Add checkbox "Student has siblings" before the textarea
- Only show siblings textarea if checkbox is checked
- Make siblings information conditional, not always required

### 4. Student History Section  
**Location:** Would need to be added or modified

**Required Changes:**
- Check program type (Playschool vs Grade 1-6)
- If Playschool: Skip student history entirely
- If Grade 1-6: Show preschool name requirement
- Conditional display based on program selection

### 5. State Updates Needed

Add to parent info state:
```typescript
const [parentInfo, setParentInfo] = useState({
  parentAvailability: '', // 'BOTH' | 'FATHER_ONLY' | 'MOTHER_ONLY' | 'SINGLE_PARENT'
  fatherHasEmail: true,
  fatherHasContactNumber: true,
  motherHasEmail: true,
  motherHasContactNumber: true,
  hasSiblings: false,
  // ... existing fields
});
```

Add component state:
```typescript
const [showFatherSection, setShowFatherSection] = useState(true);
const [showMotherSection, setShowMotherSection] = useState(true);
const [showFatherEmail, setShowFatherEmail] = useState(true);
const [showFatherContact, setShowFatherContact] = useState(true);
const [showMotherEmail, setShowMotherEmail] = useState(true);
const [showMotherContact, setShowMotherContact] = useState(true);
const [showSiblings, setShowSiblings] = useState(false);
```

## Alternative Approach

Instead of updating the massive `/enroll/page.tsx` file (2348 lines), consider:

1. **Refactor to use components:** Extract the parent information section into a reusable component that matches `ParentInformationSection.tsx`
2. **Use the existing components:** Import and use the already-updated components:
   - `ParentInformationSection` 
   - `StudentHistorySection`
   - `EnrollmentAgreementSection`

This would:
- Reduce code duplication
- Ensure consistency between enrollment flows
- Make maintenance easier
- Leverage the work already done

## Recommendation

Given the size and complexity of the enroll page, I recommend refactoring it to use the component-based approach rather than duplicating all the logic. This would be a cleaner, more maintainable solution.

Would you like me to:
A) Make all the manual updates to the enroll page (time-consuming, lots of code duplication)
B) Refactor the enroll page to use the existing updated components (cleaner, better long-term)
