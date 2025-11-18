# 🧪 Testing Guide - Teacher Interface & Enrollment Fixes

**Purpose:** Step-by-step guide to test all implemented features  
**Date:** November 18, 2025  
**Status:** Ready for Testing  

---

## 🎯 TESTING OBJECTIVES

Verify that:
1. ✅ Students can self-enroll using class codes
2. ✅ Students can view and manage their classes
3. ✅ Teacher access requires admin approval (security fix)
4. ✅ Notifications are sent for all key events
5. ✅ RLS policies protect data appropriately
6. ✅ UI is responsive and user-friendly
7. ✅ No errors or bugs

---

## 🚀 QUICK START

### Prerequisites
- Local development environment running
- Database migrations applied
- Test user accounts created (teacher + student)
- Browser with dev tools open

### Environment Setup
```bash
# 1. Start development server
npm run dev

# 2. In another terminal, start API
cd api
vercel dev

# 3. Open browser
http://localhost:5173
```

---

## TEST SUITE 1: Student Self-Enrollment

### Test 1.1: Join Class with Valid Code ✅

**Objective:** Verify student can join class using class code

**Steps:**
1. Login as teacher
2. Navigate to `/teacher/dashboard`
3. Create a new class (or use existing)
4. Note the 6-character class code (e.g., "ABC123")
5. Logout
6. Login as student (or create new student account)
7. Navigate to `/join-class`
8. Enter the class code
9. Click "Join Class"

**Expected Results:**
- ✅ Input accepts only alphanumeric characters
- ✅ Input auto-converts to uppercase
- ✅ Character counter shows "6/6"
- ✅ Green checkmark appears when complete
- ✅ Success toast: "Successfully joined [Class Name]! 🎉"
- ✅ Redirect to dashboard
- ✅ Class appears in "My Classes" tab
- ✅ Notification sent to teacher
- ✅ Notification sent to student

**How to Verify Notifications:**
```sql
-- Check notifications were created
SELECT * FROM notifications 
WHERE type IN ('student_joined', 'enrollment_confirmed')
ORDER BY created_at DESC 
LIMIT 5;

-- Should see 2 entries (one for teacher, one for student)
```

**Screenshot Checklist:**
- [ ] Join class page
- [ ] Success message
- [ ] Class in dashboard

---

### Test 1.2: Join Class with Invalid Code ❌

**Objective:** Verify proper error handling

**Steps:**
1. Navigate to `/join-class`
2. Enter invalid code: "INVALID"
3. Click "Join Class"

**Expected Results:**
- ✅ Error message: "Class not found or inactive..."
- ✅ No navigation (stays on page)
- ✅ Red error styling
- ✅ Error toast notification
- ✅ No database changes

---

### Test 1.3: Join Already Enrolled Class ❌

**Objective:** Prevent duplicate enrollments

**Steps:**
1. Join a class successfully
2. Try to join the same class again
3. Enter same class code
4. Click "Join Class"

**Expected Results:**
- ✅ Error: "You are already enrolled in this class"
- ✅ No duplicate enrollment created
- ✅ User stays enrolled

**Verify in Database:**
```sql
SELECT COUNT(*) FROM class_enrollments
WHERE student_id = [YOUR_STUDENT_ID]
AND class_id = [CLASS_ID];
-- Should return 1, not 2
```

---

## TEST SUITE 2: Student Class Management

### Test 2.1: View Enrolled Classes ✅

**Objective:** Student can see all their classes

**Steps:**
1. Login as student with enrolled classes
2. Navigate to `/dashboard`
3. Click "My Classes" tab

**Expected Results:**
- ✅ All enrolled classes displayed
- ✅ Each class shows:
  - Class name
  - Class code (badge)
  - Subject and grade level
  - Teacher name and email
  - Enrollment date
  - Assignment count
  - School year and semester
- ✅ "View Details" button on each class
- ✅ "Leave Class" button on each class
- ✅ "+ Join Class" button at top
- ✅ Responsive grid layout

**Edge Cases to Test:**
- [ ] No classes enrolled (empty state)
- [ ] One class enrolled
- [ ] Multiple classes (5+)
- [ ] Long class names (truncation)
- [ ] Missing teacher info (fallback)

---

### Test 2.2: Leave Class ✅

**Objective:** Student can unenroll from class

**Steps:**
1. In "My Classes" tab
2. Click "Leave Class" on any class
3. Confirmation dialog appears
4. Read warning message
5. Click "Leave Class" (red button)

**Expected Results:**
- ✅ Confirmation dialog with clear warning
- ✅ Warning mentions need for code to rejoin
- ✅ Loading spinner during process
- ✅ Success toast: "Left [Class Name]"
- ✅ Class removed from list immediately
- ✅ Notification sent to teacher

**Verify in Database:**
```sql
SELECT status FROM class_enrollments
WHERE student_id = [STUDENT_ID]
AND class_id = [CLASS_ID];
-- Should return 'dropped', not deleted
```

**Test Cancel:**
1. Click "Leave Class"
2. Click "Cancel" in dialog
3. Verify nothing changes

---

### Test 2.3: Empty State ✅

**Objective:** Helpful UI when no classes

**Steps:**
1. Create new student account
2. Navigate to dashboard
3. Click "My Classes" tab

**Expected Results:**
- ✅ Empty state with icon
- ✅ Message: "No classes yet"
- ✅ Helpful description
- ✅ Big "+ Join a Class" button
- ✅ Button navigates to `/join-class`

---

## TEST SUITE 3: Teacher Access Security

### Test 3.1: Teacher Access Request (Security Fix) 🔒

**Objective:** Verify requests are pending, not auto-approved

**Steps:**
1. Create new user account (or logout)
2. Navigate to `/teacher/dashboard`
3. Click "Request Teacher Access"
4. Fill out form:
   - Institution Name: "Test High School"
   - Institution Type: "High School"
   - Department: "Computer Science"
   - Request Reason: "I want to create ethics courses"
5. Click "Submit Request"

**Expected Results:**
- ✅ Success message: "Request Submitted! 📝"
- ✅ Description mentions "24-48 hours"
- ✅ Modal closes
- ✅ User does NOT navigate to teacher dashboard
- ✅ User role stays 'user' (NOT 'teacher')
- ✅ Request created with status 'pending'

**CRITICAL: Verify Security Fix:**
```sql
-- Check user role did NOT change
SELECT role FROM users WHERE email = '[YOUR_EMAIL]';
-- Should return 'user' or 'student', NOT 'teacher'

-- Check request is pending
SELECT status, created_at FROM teacher_access_requests
WHERE user_id = [YOUR_USER_ID]
ORDER BY created_at DESC LIMIT 1;
-- Should return status = 'pending'

-- Verify NO auto-approval audit trail
SELECT * FROM role_change_log
WHERE user_id = [YOUR_USER_ID]
ORDER BY changed_at DESC LIMIT 1;
-- Should return 0 rows (no role change yet)
```

**If Test Fails (Security Breach!):**
```
🚨 CRITICAL SECURITY ISSUE 🚨

If role changes to 'teacher' immediately:
1. Stop deployment immediately
2. Review api/teacher.ts lines 540-580
3. Verify security fix is applied
4. Check for auto-approval code
5. Re-test before deploying
```

---

### Test 3.2: Teacher Dashboard Access Blocked ✅

**Objective:** Non-teachers cannot access teacher dashboard

**Steps:**
1. With pending request (not approved)
2. Try to navigate to `/teacher/dashboard`

**Expected Results:**
- ✅ "Teacher Access Required" message
- ✅ Cannot see teacher features
- ✅ See status of pending request
- ✅ No data leaks

---

## TEST SUITE 4: Notifications System

### Test 4.1: Enrollment Notifications ✅

**Objective:** Verify notifications sent for enrollment

**Setup:**
1. Have teacher account with class
2. Have student account (not enrolled)

**Test:**
1. Student joins class (Test 1.1)
2. Check notifications table

**Expected Database State:**
```sql
-- Student should receive notification
SELECT * FROM notifications
WHERE recipient_id = [STUDENT_ID]
AND type = 'enrollment_confirmed'
AND created_at > NOW() - INTERVAL '1 minute';

-- Should return 1 row:
{
  type: 'enrollment_confirmed',
  title: '✅ Successfully Enrolled',
  message: 'You've been enrolled in [Class Name] taught by [Teacher]',
  priority: 'high',
  is_read: false
}

-- Teacher should receive notification
SELECT * FROM notifications
WHERE recipient_id = [TEACHER_ID]
AND type = 'student_joined'
AND created_at > NOW() - INTERVAL '1 minute';

-- Should return 1 row:
{
  type: 'student_joined',
  title: '🎓 New Student Enrolled',
  message: '[Student Name] ([email]) has joined your class: [Class Name]',
  priority: 'medium',
  is_read: false
}
```

---

### Test 4.2: Unenrollment Notifications ✅

**Objective:** Teacher notified when student leaves

**Steps:**
1. Student leaves class (Test 2.2)
2. Check notifications table

**Expected:**
```sql
SELECT * FROM notifications
WHERE recipient_id = [TEACHER_ID]
AND type = 'student_left'
ORDER BY created_at DESC LIMIT 1;

-- Should return:
{
  type: 'student_left',
  title: '👋 Student Left Class',
  message: '[Student Name] ([email]) has left your class: [Class Name]',
  priority: 'low'
}
```

---

### Test 4.3: Manual Enrollment Notification ✅

**Objective:** Student notified when teacher adds them

**Steps:**
1. Login as teacher
2. Navigate to class detail page
3. Click "Add Student"
4. Enter student email
5. Click "Add"
6. Check notifications table

**Expected:**
```sql
SELECT * FROM notifications
WHERE recipient_id = [STUDENT_ID]
AND type = 'teacher_added'
ORDER BY created_at DESC LIMIT 1;

-- Should return:
{
  type: 'teacher_added',
  title: '🎓 Added to Class',
  message: '[Teacher Name] has added you to [Class Name]',
  priority: 'high'
}
```

---

## TEST SUITE 5: Row Level Security (RLS)

### Test 5.1: Student Data Isolation 🔒

**Objective:** Students can only see their own data

**Prerequisites:**
- Migration 012 applied
- RLS enabled on all tables
- 2+ student accounts with enrollments

**Tests:**

**Test 5.1a: Cannot See Other Students' Classes**
```sql
-- Login as Student A
-- Try to query all classes
SELECT * FROM classes;

-- Should only return classes where:
-- - Student A is enrolled, OR
-- - Class is active (public listing)

-- Should NOT return:
-- - Classes where only Student B is enrolled
-- - Inactive classes
```

**Test 5.1b: Cannot See Other Students' Submissions**
```sql
-- Login as Student A
-- Try to query all submissions
SELECT * FROM assignment_submissions;

-- Should only return:
-- - Student A's own submissions

-- Should NOT return:
-- - Student B's submissions
-- - Any other student's submissions
```

**Test 5.1c: Cannot Modify Other Students' Enrollments**
```sql
-- Login as Student A
-- Try to update Student B's enrollment
UPDATE class_enrollments
SET status = 'dropped'
WHERE student_id = [STUDENT_B_ID];

-- Should fail with permission denied
-- OR return 0 rows affected
```

---

### Test 5.2: Teacher Data Isolation 🔒

**Objective:** Teachers can only see their own classes

**Prerequisites:**
- 2+ teacher accounts with classes

**Tests:**

**Test 5.2a: Cannot See Other Teachers' Classes**
```sql
-- Login as Teacher A
-- Try to query all classes
SELECT * FROM classes;

-- Should only return:
-- - Teacher A's own classes

-- Should NOT return:
-- - Teacher B's classes
-- - Other teachers' classes
```

**Test 5.2b: Cannot Grade Other Teachers' Submissions**
```sql
-- Login as Teacher A
-- Try to update submission in Teacher B's class
UPDATE assignment_submissions
SET final_score = 100
WHERE assignment_id IN (
  SELECT id FROM assignments
  WHERE class_id IN (
    SELECT id FROM classes WHERE teacher_id = [TEACHER_B_ID]
  )
);

-- Should fail or return 0 rows affected
```

---

### Test 5.3: Public Access Controls 🔒

**Objective:** Non-authenticated users limited access

**Tests:**

**Test 5.3a: Can View Active Classes**
```sql
-- Without authentication
SELECT * FROM classes WHERE is_active = true;

-- Should succeed
-- This allows class code enrollment
```

**Test 5.3b: Cannot View Enrollments**
```sql
-- Without authentication
SELECT * FROM class_enrollments;

-- Should fail with permission denied
```

---

## TEST SUITE 6: UI/UX Testing

### Test 6.1: Responsive Design ✅

**Devices to Test:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Pages to Test:**
- [ ] `/join-class`
- [ ] `/dashboard` (My Classes tab)
- [ ] Teacher dashboard

**Checklist per Page:**
- [ ] No horizontal scrolling
- [ ] Text readable without zoom
- [ ] Buttons easily tappable (44x44px minimum)
- [ ] Forms usable on mobile
- [ ] Cards stack properly
- [ ] Navigation accessible

---

### Test 6.2: Accessibility ✅

**Keyboard Navigation:**
1. Use only Tab and Enter keys
2. Navigate entire `/join-class` page
3. Submit form without mouse

**Expected:**
- ✅ All interactive elements reachable
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Can submit form with Enter

**Screen Reader:**
1. Enable screen reader (VoiceOver, NVDA, JAWS)
2. Navigate `/join-class`
3. Listen to announcements

**Expected:**
- ✅ Proper ARIA labels
- ✅ Error messages announced
- ✅ Success messages announced
- ✅ Form fields labeled

**Color Contrast:**
1. Use contrast checker tool
2. Check all text elements

**Expected:**
- ✅ All text meets WCAG AA (4.5:1 ratio)
- ✅ Error messages readable

---

### Test 6.3: Loading States ✅

**Test All Loading Scenarios:**

**Join Class Loading:**
1. Enter valid code
2. Click submit
3. Observe loading state

**Expected:**
- ✅ Button shows spinner
- ✅ Button text changes to "Joining..."
- ✅ Button disabled during loading
- ✅ Input disabled during loading

**Class List Loading:**
1. Navigate to "My Classes" tab
2. Observe initial load

**Expected:**
- ✅ Skeleton loaders displayed
- ✅ 3 card skeletons
- ✅ Pulse animation
- ✅ Smooth transition to real data

**Leave Class Loading:**
1. Click "Leave Class"
2. In dialog, click "Leave Class"
3. Observe loading

**Expected:**
- ✅ Button shows spinner
- ✅ Button text "Leaving..."
- ✅ Cancel button disabled
- ✅ Dialog stays open until complete

---

## TEST SUITE 7: Error Handling

### Test 7.1: Network Errors ❌

**Objective:** Graceful handling of network failures

**Setup:**
1. Open browser dev tools
2. Network tab → Throttle to "Offline"

**Tests:**

**Test 7.1a: Join Class Offline**
1. Navigate to `/join-class`
2. Enter valid code
3. Click submit

**Expected:**
- ✅ Error message displayed
- ✅ Error toast notification
- ✅ No crash or white screen
- ✅ User can retry

**Test 7.1b: Load Classes Offline**
1. Navigate to "My Classes" tab

**Expected:**
- ✅ Error message displayed
- ✅ "Try Again" button shown
- ✅ No crash

---

### Test 7.2: API Errors ❌

**Objective:** Handle server errors gracefully

**Simulate 500 Error:**
```typescript
// Temporarily modify api/student.ts
return res.status(500).json({ error: 'Simulated error' });
```

**Test:**
1. Try to join class
2. Observe error handling

**Expected:**
- ✅ User-friendly error message
- ✅ Not exposed stack trace
- ✅ Error logged to console
- ✅ User can retry

---

### Test 7.3: Authentication Errors ❌

**Objective:** Handle auth failures

**Steps:**
1. Clear localStorage (logout)
2. Navigate to `/join-class`

**Expected:**
- ✅ "Login Required" message
- ✅ Link to home/login
- ✅ No API calls made
- ✅ No crash

---

## TEST SUITE 8: Performance

### Test 8.1: Load Times ⚡

**Objective:** Pages load quickly

**Measurements:**
- [ ] `/join-class` loads in <2s
- [ ] "My Classes" tab loads in <2s
- [ ] API responses in <500ms

**Tools:**
- Chrome DevTools → Network tab
- Lighthouse performance audit

**Target Scores:**
- [ ] Performance: 90+
- [ ] Accessibility: 100
- [ ] Best Practices: 90+
- [ ] SEO: 90+

---

### Test 8.2: Large Data Sets ⚡

**Objective:** Handles many classes/students

**Setup:**
1. Create 50+ classes for one teacher
2. Enroll student in 20+ classes

**Test:**
1. Load "My Classes" tab
2. Measure load time
3. Check for lag/stuttering

**Expected:**
- ✅ Loads in <3s
- ✅ Smooth scrolling
- ✅ No UI freezing
- ✅ Pagination or virtualization if needed

---

## 🐛 BUG REPORTING TEMPLATE

If you find a bug, report it with:

```markdown
### Bug Report

**Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots:**
[Attach images]

**Environment:**
- OS: 
- Browser: 
- Screen size: 

**Error Messages:**
```
[Paste console errors]
```

**Database State:**
```sql
-- Relevant queries and results
```
```

---

## ✅ TESTING CHECKLIST

### Before Deployment
- [ ] All Test Suite 1 tests pass (Student enrollment)
- [ ] All Test Suite 2 tests pass (Class management)
- [ ] All Test Suite 3 tests pass (Security fix) **CRITICAL**
- [ ] All Test Suite 4 tests pass (Notifications)
- [ ] All Test Suite 5 tests pass (RLS) **CRITICAL**
- [ ] All Test Suite 6 tests pass (UI/UX)
- [ ] All Test Suite 7 tests pass (Error handling)
- [ ] All Test Suite 8 tests pass (Performance)

### Critical Security Tests
- [ ] Teacher access NOT auto-approved
- [ ] Students cannot see other students' data
- [ ] Teachers cannot see other teachers' data
- [ ] RLS policies enforced
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

### User Experience Tests
- [ ] All loading states work
- [ ] All error messages clear
- [ ] Navigation intuitive
- [ ] Mobile responsive
- [ ] Accessible (keyboard + screen reader)

### Edge Cases
- [ ] Empty states handled
- [ ] Long text truncated
- [ ] Special characters in input
- [ ] Concurrent enrollments
- [ ] Duplicate submissions

---

## 🎓 TESTING TIPS

### Quick Testing Shortcuts

**Reset Test Data:**
```sql
-- Delete test enrollments
DELETE FROM class_enrollments WHERE student_id = [TEST_STUDENT_ID];

-- Delete test notifications
DELETE FROM notifications WHERE recipient_id IN ([TEST_USER_IDS]);

-- Reset test user role
UPDATE users SET role = 'user' WHERE email = '[test@example.com]';

-- Delete test access requests
DELETE FROM teacher_access_requests WHERE user_id = [TEST_USER_ID];
```

**Create Test Users Fast:**
```sql
-- Create test student
INSERT INTO users (email, username, role)
VALUES ('student-test@example.com', 'test_student', 'user');

-- Create test teacher
INSERT INTO users (email, username, role)
VALUES ('teacher-test@example.com', 'test_teacher', 'teacher');
```

**Generate Test Classes:**
```sql
-- Create test class
INSERT INTO classes (name, teacher_id, class_code, is_active)
VALUES ('Test Ethics Class', [TEACHER_ID], 'TEST01', true);
```

### Browser Testing Tips

**Test in Multiple Browsers:**
- Chrome (primary)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Android)

**Use Browser Features:**
- DevTools → Network tab (monitor requests)
- DevTools → Console (check for errors)
- DevTools → Application → Storage (check localStorage)
- DevTools → Lighthouse (performance audit)

---

## 📊 TEST RESULTS TEMPLATE

```markdown
## Test Results - [Date]

### Summary
- Tests Run: [X]
- Tests Passed: [X]
- Tests Failed: [X]
- Pass Rate: [X]%

### Priority 1 Tests
- Student Enrollment: ✅ PASS
- Class Management: ✅ PASS
- Security Fix: ✅ PASS **CRITICAL**

### Priority 2 Tests
- Notifications: ✅ PASS
- RLS Policies: ✅ PASS **CRITICAL**

### UI/UX Tests
- Responsive Design: ✅ PASS
- Accessibility: ✅ PASS
- Loading States: ✅ PASS

### Failed Tests
1. [Test Name] - [Reason] - [Severity]

### Bugs Found
1. [Bug Description] - [Severity] - [Status]

### Ready for Deployment?
[YES / NO] - [Reason]

### Notes
[Any additional observations]
```

---

## 🚀 PRE-DEPLOYMENT FINAL CHECK

**Critical Items:**
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Security tests pass (Test Suite 3 & 5)
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Backup created
- [ ] Rollback plan ready

**Documentation:**
- [ ] README updated
- [ ] API docs updated
- [ ] User guides created
- [ ] Changelog written

**Monitoring:**
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Log monitoring set up

**Communication:**
- [ ] Users notified of new features
- [ ] Support team briefed
- [ ] FAQ updated

---

**Testing Complete!** 🎉

If all tests pass, proceed with deployment following the deployment guide in `IMPLEMENTATION_SUMMARY.md`.

**Last Updated:** November 18, 2025  
**Status:** Ready for Testing  
**Estimated Testing Time:** 2-4 hours for full suite

