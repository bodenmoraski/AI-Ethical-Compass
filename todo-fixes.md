# ✅ TODO: Teacher Interface & Enrollment Fixes

**Created:** November 18, 2025  
**Total Tasks:** 127  
**Completed:** 0  
**In Progress:** 0  
**Blocked:** 0  

---

## 🔴 PRIORITY 1: CRITICAL BLOCKERS

### Task 1: Create Student API Endpoint (`api/student.ts`)

#### 1.1 Setup & Structure
- [ ] Create new file `api/student.ts`
- [ ] Add imports (VercelRequest, VercelResponse, createClient, z)
- [ ] Setup Supabase client with env variables
- [ ] Add TypeScript interfaces for responses

#### 1.2 Authentication Helper
- [ ] Create `authenticateStudent()` function
- [ ] Extract Bearer token from Authorization header
- [ ] Verify token with `supabase.auth.getUser(token)`
- [ ] Query users table for profile
- [ ] Return userId and email
- [ ] Add error handling for invalid tokens

#### 1.3 Validation Schemas
- [ ] Create `JoinClassSchema` with Zod
  - [ ] class_code: string, length 6, uppercase transform
  - [ ] Regex validation for alphanumeric only
- [ ] Create `LeaveClassSchema` with Zod
  - [ ] class_id: number, integer, positive

#### 1.4 Main Handler Setup
- [ ] Create default handler function
- [ ] Add CORS headers (Allow-Origin, Allow-Methods, Allow-Headers)
- [ ] Handle OPTIONS preflight requests
- [ ] Create try/catch wrapper
- [ ] Route by action query parameter
- [ ] Return proper error responses

#### 1.5 Join Class Handler (`handleJoinClass`)
- [ ] Accept POST method only
- [ ] Call `authenticateStudent()` for auth
- [ ] Validate request body with `JoinClassSchema`
- [ ] Query classes table for matching class_code
  - [ ] Filter by is_active = true
  - [ ] Select id, name, subject, grade_level, teacher_id
- [ ] Handle class not found (404 error)
- [ ] Query class_enrollments for duplicate check
  - [ ] Match class_id and student_id
- [ ] Handle already enrolled (400 error)
- [ ] Insert new enrollment record
  - [ ] Set status = 'active'
  - [ ] Auto-set enrollment_date
- [ ] Handle database insert errors
- [ ] Return success response with class data
- [ ] Return 201 status code

#### 1.6 Get Classes Handler (`handleGetClasses`)
- [ ] Accept GET method only
- [ ] Call `authenticateStudent()` for auth
- [ ] Query class_enrollments with joins
  - [ ] Join to classes table
  - [ ] Join to users table for teacher info
  - [ ] Filter by student_id and status = 'active'
  - [ ] Order by enrollment_date DESC
- [ ] Transform response data
  - [ ] Format teacher_name from first + last
  - [ ] Extract teacher_email
  - [ ] Include enrollment_date
  - [ ] Count assignments per class
- [ ] Handle empty results gracefully
- [ ] Return success response with classes array

#### 1.7 Leave Class Handler (`handleLeaveClass`)
- [ ] Accept POST/DELETE methods
- [ ] Call `authenticateStudent()` for auth
- [ ] Parse class_id from query or body
- [ ] Validate with `LeaveClassSchema`
- [ ] Update class_enrollment status to 'dropped'
  - [ ] Match by class_id and student_id
  - [ ] Don't delete, just update status
- [ ] Handle not enrolled error
- [ ] Return success response

#### 1.8 Testing
- [ ] Test join with valid code
- [ ] Test join with invalid code
- [ ] Test join with inactive class
- [ ] Test duplicate enrollment prevention
- [ ] Test get classes with no enrollments
- [ ] Test get classes with multiple enrollments
- [ ] Test leave class successfully
- [ ] Test leave class not enrolled
- [ ] Test all auth failures
- [ ] Test CORS headers present

---

### Task 2: Create Join Class UI Page

#### 2.1 Create Component File
- [ ] Create `client/src/pages/JoinClass.tsx`
- [ ] Add imports (React, hooks, components, icons)
- [ ] Define component structure
- [ ] Export default

#### 2.2 State Management
- [ ] Add `classCode` state (string)
- [ ] Add `loading` state (boolean)
- [ ] Add `error` state (string | null)
- [ ] Initialize useNavigate hook
- [ ] Initialize useToast hook
- [ ] Initialize useAuth hook

#### 2.3 Input Handler
- [ ] Create `handleInputChange` function
  - [ ] Transform to uppercase
  - [ ] Limit to 6 characters
  - [ ] Allow only alphanumeric
  - [ ] Update state

#### 2.4 Submit Handler
- [ ] Create `handleSubmit` async function
- [ ] Prevent default form submission
- [ ] Validate class code length
- [ ] Set loading state
- [ ] Get session token from Supabase
- [ ] Make POST request to `/api/student?action=join-class`
  - [ ] Include Bearer token
  - [ ] Send class_code in body
- [ ] Handle success response
  - [ ] Show success toast
  - [ ] Navigate to dashboard or class list
- [ ] Handle error responses
  - [ ] Show error toast with message
  - [ ] Display inline error
- [ ] Reset loading state

#### 2.5 UI Layout
- [ ] Create container div with proper padding
- [ ] Add Card component
- [ ] Add CardHeader with title and description
- [ ] Add CardContent with form

#### 2.6 Form Elements
- [ ] Create form element with onSubmit
- [ ] Add Label for class code
- [ ] Add Input component
  - [ ] Placeholder text
  - [ ] Value bound to state
  - [ ] onChange handler
  - [ ] maxLength 6
  - [ ] Pattern validation
  - [ ] Auto-uppercase CSS
- [ ] Add helper text below input
- [ ] Add error message display (conditional)

#### 2.7 Submit Button
- [ ] Add Button component
  - [ ] Type="submit"
  - [ ] Disabled when loading or code invalid
  - [ ] Show loading spinner when loading
  - [ ] Full width
- [ ] Add button text (Join Class / Joining...)

#### 2.8 Additional Features
- [ ] Add link to "View My Classes"
- [ ] Add link back to Dashboard
- [ ] Add visual feedback for valid code (checkmark)
- [ ] Add character counter (X/6)

#### 2.9 Styling
- [ ] Responsive layout (mobile-first)
- [ ] Max width container
- [ ] Proper spacing between elements
- [ ] Button hover states
- [ ] Input focus states
- [ ] Error message styling (red)
- [ ] Success state styling (green)

#### 2.10 Accessibility
- [ ] Add aria-labels
- [ ] Add aria-describedby for errors
- [ ] Ensure keyboard navigation works
- [ ] Add focus management
- [ ] Screen reader friendly messages

#### 2.11 Testing
- [ ] Test with valid class code
- [ ] Test with invalid class code
- [ ] Test with too short code
- [ ] Test with special characters
- [ ] Test loading states
- [ ] Test error display
- [ ] Test success flow
- [ ] Test navigation
- [ ] Test keyboard input
- [ ] Test mobile layout

---

### Task 3: Create Student Class List Component

#### 3.1 Create Component File
- [ ] Create `client/src/components/student/StudentClassList.tsx`
- [ ] Add all necessary imports
- [ ] Define TypeScript interfaces for Class
- [ ] Export default component

#### 3.2 State Management
- [ ] Add `classes` state (Class[])
- [ ] Add `loading` state (boolean)
- [ ] Add `error` state (string | null)
- [ ] Add `showLeaveDialog` state (boolean)
- [ ] Add `selectedClass` state (Class | null)

#### 3.3 Data Fetching
- [ ] Create `fetchClasses` async function
- [ ] Set loading state
- [ ] Get session token from Supabase
- [ ] Fetch from `/api/student?action=classes`
  - [ ] Include Bearer token
- [ ] Parse response
- [ ] Update classes state
- [ ] Handle errors
- [ ] Reset loading state

#### 3.4 useEffect Setup
- [ ] Call fetchClasses on mount
- [ ] Add empty dependency array

#### 3.5 Leave Class Handler
- [ ] Create `handleLeaveClick` function
  - [ ] Set selectedClass
  - [ ] Show confirmation dialog
- [ ] Create `confirmLeaveClass` async function
  - [ ] Make POST request to leave endpoint
  - [ ] Show success toast
  - [ ] Refresh class list
  - [ ] Handle errors
  - [ ] Close dialog

#### 3.6 Loading State UI
- [ ] Create skeleton loader
- [ ] Show 3 card skeletons
- [ ] Animate pulse effect

#### 3.7 Empty State UI
- [ ] Create empty state component
- [ ] Add icon (BookOpen)
- [ ] Add message "No classes yet"
- [ ] Add description text
- [ ] Add "Join a Class" button
  - [ ] Navigate to /join-class

#### 3.8 Class Card Component
- [ ] Map over classes array
- [ ] Create Card for each class
- [ ] Add CardHeader with class name
- [ ] Add Badge with class code
- [ ] Display subject and grade level
- [ ] Display teacher name
- [ ] Display enrollment date

#### 3.9 Class Card Actions
- [ ] Add "View Details" button
  - [ ] Navigate to class details page
- [ ] Add "Leave Class" button
  - [ ] Show confirmation dialog
  - [ ] Red/destructive styling

#### 3.10 Confirmation Dialog
- [ ] Use AlertDialog component
- [ ] Set title with class name
- [ ] Add warning message
- [ ] Add Cancel button
- [ ] Add Confirm button (red)
- [ ] Handle dialog state

#### 3.11 Styling
- [ ] Card grid layout (responsive)
- [ ] Proper spacing between cards
- [ ] Hover effects on cards
- [ ] Button styling
- [ ] Badge positioning
- [ ] Icon alignment

#### 3.12 Testing
- [ ] Test with no classes
- [ ] Test with one class
- [ ] Test with multiple classes
- [ ] Test loading state
- [ ] Test error state
- [ ] Test leave confirmation
- [ ] Test successful leave
- [ ] Test view details navigation

---

### Task 4: Add to Student Dashboard

#### 4.1 Update Dashboard.tsx
- [ ] Open `client/src/pages/Dashboard.tsx`
- [ ] Import StudentClassList component
- [ ] Locate Tabs component
- [ ] Add new TabsTrigger "My Classes"
- [ ] Add new TabsContent "classes"
- [ ] Render StudentClassList in content

#### 4.2 Update Tab Order
- [ ] Ensure logical tab order
- [ ] Update tab indices
- [ ] Test tab navigation

#### 4.3 Add Quick Stats
- [ ] Add class count to overview
- [ ] Display in stat card
- [ ] Format nicely

#### 4.4 Testing
- [ ] Test tab switching
- [ ] Test with no classes
- [ ] Test with classes
- [ ] Test responsive layout

---

### Task 5: Update Navigation

#### 5.1 Update App.tsx Routing
- [ ] Open `client/src/App.tsx`
- [ ] Import JoinClass component
- [ ] Add route `/join-class`
- [ ] Ensure proper Route nesting

#### 5.2 Update Navbar (Optional)
- [ ] Open `client/src/components/Navbar.tsx`
- [ ] Consider adding "Join Class" link for students
- [ ] Use conditional rendering based on role
- [ ] Test navigation

#### 5.3 Update UserMenu
- [ ] Consider adding "My Classes" to user menu
- [ ] Add link to /join-class
- [ ] Test dropdown menu

#### 5.4 Testing
- [ ] Test all navigation links
- [ ] Test direct URL access
- [ ] Test breadcrumbs
- [ ] Test back button

---

### Task 6: Fix Teacher Access Auto-Approval

#### 6.1 Update api/teacher.ts
- [ ] Open `api/teacher.ts`
- [ ] Locate `handleTeacherAccess` function
- [ ] Find the auto-approval code (line ~540-556)
- [ ] Comment out or remove user role update
- [ ] Keep only the request insertion
- [ ] Change status to 'pending'
- [ ] Update success message

#### 6.2 Update Response Message
- [ ] Change toast title to "Request Submitted"
- [ ] Update description to mention review process
- [ ] Add estimated timeline (24-48 hours)
- [ ] Remove role from response

#### 6.3 Update Frontend Modal
- [ ] Open `client/src/components/TeacherAccessModal.tsx`
- [ ] Update success message
- [ ] Remove navigation to teacher dashboard
- [ ] Add info about email notification
- [ ] Update button text if needed

#### 6.4 Create Admin Review Endpoint (Future)
- [ ] Create `api/admin.ts` file
- [ ] Add authenticateAdmin helper
- [ ] Add review-teacher-request handler
- [ ] Implement approve logic
- [ ] Implement reject logic
- [ ] Add audit logging

#### 6.5 Testing
- [ ] Submit teacher access request
- [ ] Verify status is 'pending'
- [ ] Verify role doesn't change
- [ ] Verify success message correct
- [ ] Check database state

---

## 🟠 PRIORITY 2: HIGH IMPACT

### Task 7: Add Enrollment Notifications

#### 7.1 Create Notifications Helper
- [ ] Create `lib/notifications.ts` file
- [ ] Import Supabase client
- [ ] Create `createNotification` function
  - [ ] Accept recipient_id, type, title, message, data
  - [ ] Insert into notifications table
  - [ ] Set is_read = false
  - [ ] Handle errors gracefully

#### 7.2 Specific Notification Functions
- [ ] Create `notifyTeacherOfEnrollment` function
  - [ ] Get teacher ID
  - [ ] Format message with student name
  - [ ] Create notification
- [ ] Create `notifyStudentOfEnrollment` function
  - [ ] Get student ID
  - [ ] Format message with class name
  - [ ] Create notification

#### 7.3 Integrate into Student API
- [ ] Open `api/student.ts`
- [ ] Import notification helpers
- [ ] In `handleJoinClass`, after enrollment:
  - [ ] Get teacher name from database
  - [ ] Call `notifyTeacherOfEnrollment`
  - [ ] Call `notifyStudentOfEnrollment`
- [ ] Handle notification errors (don't fail enrollment)

#### 7.4 Integrate into Teacher API
- [ ] Open `api/teacher.ts`
- [ ] Import notification helpers
- [ ] In `handleStudents` POST, after manual add:
  - [ ] Call `notifyStudentOfEnrollment`
- [ ] Handle errors gracefully

#### 7.5 Create Notification UI Component
- [ ] Create `client/src/components/NotificationBell.tsx`
- [ ] Add bell icon with badge
- [ ] Fetch unread count
- [ ] Create dropdown component
- [ ] Display notification list
- [ ] Add mark as read functionality
- [ ] Add click to navigate

#### 7.6 Add to Navbar
- [ ] Import NotificationBell
- [ ] Add to header
- [ ] Position next to UserMenu
- [ ] Test responsive layout

#### 7.7 Testing
- [ ] Test notification creation
- [ ] Test notification display
- [ ] Test mark as read
- [ ] Test navigation from notification
- [ ] Test with multiple notifications

---

### Task 8: Implement Student Unenrollment UI

#### 8.1 Update StudentClassList Component
- [ ] Already implemented in Task 3
- [ ] Ensure Leave Class button works
- [ ] Ensure confirmation dialog works
- [ ] Test complete flow

#### 8.2 Add Teacher Notification
- [ ] When student leaves, notify teacher
- [ ] Use notification helper
- [ ] Format message appropriately

#### 8.3 Testing
- [ ] Student can leave class
- [ ] Teacher receives notification
- [ ] Student removed from roster
- [ ] Assignments no longer visible

---

### Task 9: Fix RLS Policies

#### 9.1 Create Migration File
- [ ] Create `server/migrations/012_fix_rls_policies.sql`
- [ ] Add header comment

#### 9.2 Enable RLS
- [ ] Add ALTER TABLE ... ENABLE RLS for:
  - [ ] classes
  - [ ] class_enrollments
  - [ ] assignments
  - [ ] assignment_submissions
  - [ ] notifications

#### 9.3 Drop Old Policies
- [ ] DROP POLICY IF EXISTS for all old policies
- [ ] One for each table

#### 9.4 Create New Policies - Classes
- [ ] "Teachers manage own classes"
  - [ ] FOR ALL
  - [ ] USING teacher_id matches auth.uid()
- [ ] "Students view enrolled classes"
  - [ ] FOR SELECT
  - [ ] USING class in enrollments for auth.uid()

#### 9.5 Create New Policies - Enrollments
- [ ] "Students view own enrollments"
  - [ ] FOR SELECT
  - [ ] USING student_id matches auth.uid()
- [ ] "Students join classes"
  - [ ] FOR INSERT
  - [ ] WITH CHECK student_id matches auth.uid()
- [ ] "Students update own enrollments"
  - [ ] FOR UPDATE
  - [ ] USING student_id matches auth.uid()

#### 9.6 Create New Policies - Assignments
- [ ] "Teachers manage assignments"
  - [ ] FOR ALL
  - [ ] USING class owned by auth.uid()
- [ ] "Students view published assignments"
  - [ ] FOR SELECT
  - [ ] USING is_published AND enrolled in class

#### 9.7 Create New Policies - Submissions
- [ ] "Students manage own submissions"
  - [ ] FOR ALL
  - [ ] USING student_id matches auth.uid()
- [ ] "Teachers view class submissions"
  - [ ] FOR SELECT
  - [ ] USING assignment in owned class

#### 9.8 Test Each Policy
- [ ] Test as student user
- [ ] Test as teacher user
- [ ] Test unauthorized access attempts
- [ ] Verify no data leaks
- [ ] Check performance impact

#### 9.9 Run Migration
- [ ] Test in development first
- [ ] Backup database
- [ ] Run migration
- [ ] Verify all policies active
- [ ] Test application still works

#### 9.10 Document Changes
- [ ] Add comments to migration
- [ ] Update RLS documentation
- [ ] Note performance considerations

---

## 🟡 PRIORITY 3: MEDIUM ENHANCEMENTS

### Task 10: Class Details Page for Students

#### 10.1 Create Page Component
- [ ] Create `client/src/pages/ClassDetails.tsx`
- [ ] Add route parameter for classId
- [ ] Set up state management

#### 10.2 Data Fetching
- [ ] Fetch class details
- [ ] Fetch upcoming assignments
- [ ] Fetch recent announcements
- [ ] Handle loading/error states

#### 10.3 UI Layout
- [ ] Class header with name, teacher
- [ ] Description section
- [ ] Assignments section
- [ ] Resources section (if any)
- [ ] Class info sidebar

#### 10.4 Testing
- [ ] Test with valid class
- [ ] Test with invalid class
- [ ] Test permissions
- [ ] Test responsive layout

---

### Task 11: Bulk Student Import

#### 11.1 Create CSV Upload Component
- [ ] File input component
- [ ] Drag & drop support
- [ ] File validation
- [ ] Preview uploaded data

#### 11.2 CSV Parser
- [ ] Parse CSV file
- [ ] Validate format
- [ ] Check for required fields (email)
- [ ] Handle errors gracefully

#### 11.3 Bulk Insert API
- [ ] Create endpoint for bulk insert
- [ ] Validate all emails
- [ ] Check for duplicates
- [ ] Insert valid records
- [ ] Return success/failure report

#### 11.4 UI Feedback
- [ ] Progress indicator
- [ ] Success/error summary
- [ ] Download error report
- [ ] Refresh student list

#### 11.5 Testing
- [ ] Test valid CSV
- [ ] Test invalid format
- [ ] Test duplicate emails
- [ ] Test partial success

---

### Task 12: Roster Export

#### 12.1 Export Button
- [ ] Add to StudentManager component
- [ ] Add download icon
- [ ] Position in toolbar

#### 12.2 Generate CSV
- [ ] Fetch all students
- [ ] Format as CSV
- [ ] Include: email, name, enrollment date
- [ ] Create downloadable blob

#### 12.3 Download Handler
- [ ] Create link element
- [ ] Trigger download
- [ ] Clean up resources
- [ ] Show success message

#### 12.4 Testing
- [ ] Test with various class sizes
- [ ] Verify CSV format
- [ ] Test special characters
- [ ] Test on different browsers

---

## 🔵 PRIORITY 4: LOW PRIORITY

### Task 13: Class Groups UI

- [ ] Create GroupManager component
- [ ] Add group creation form
- [ ] Add student assignment interface
- [ ] Add group-based assignment option
- [ ] Test group functionality

### Task 14: Class Cloning

- [ ] Add "Clone Class" button
- [ ] Create cloning dialog
- [ ] API endpoint for cloning
- [ ] Generate new class code
- [ ] Option to include assignments
- [ ] Test cloning flow

### Task 15: Class Capacity

- [ ] Add max_students field to classes table
- [ ] Update class creation form
- [ ] Validate enrollment count
- [ ] Display "Class Full" message
- [ ] Test capacity limits

---

## 🧪 TESTING TASKS

### Integration Testing
- [ ] Student enrollment flow (end-to-end)
- [ ] Teacher manual add flow
- [ ] Notification delivery
- [ ] Leave class flow
- [ ] Assignment visibility after enrollment

### Security Testing
- [ ] RLS policies enforced
- [ ] Cannot join without auth
- [ ] Cannot see other users' classes
- [ ] Cannot modify other users' enrollments
- [ ] SQL injection attempts fail

### Performance Testing
- [ ] Large class sizes (100+ students)
- [ ] Multiple concurrent enrollments
- [ ] Database query performance
- [ ] API response times under load

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Focus management correct

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## 📝 DOCUMENTATION TASKS

### API Documentation
- [ ] Document student API endpoints
- [ ] Add request/response examples
- [ ] Document error codes
- [ ] Add authentication requirements
- [ ] Update API reference

### User Documentation
- [ ] Update teacher guide
- [ ] Create student enrollment guide
- [ ] Add troubleshooting section
- [ ] Create FAQ
- [ ] Add screenshots

### Code Documentation
- [ ] Add JSDoc comments to functions
- [ ] Document component props
- [ ] Add inline comments for complex logic
- [ ] Update README
- [ ] Create CHANGELOG

---

## 🚀 DEPLOYMENT TASKS

### Pre-Deployment
- [ ] Review all code changes
- [ ] Run all tests
- [ ] Check for linting errors
- [ ] Verify environment variables
- [ ] Create deployment checklist

### Database Migration
- [ ] Backup production database
- [ ] Test migration in staging
- [ ] Prepare rollback script
- [ ] Schedule maintenance window
- [ ] Run migration
- [ ] Verify migration success

### Code Deployment
- [ ] Create feature branch
- [ ] Open pull request
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Test in staging
- [ ] Deploy to production

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify user flows work
- [ ] Monitor database performance
- [ ] Collect user feedback

---

## 📊 PROGRESS TRACKING

### Priority 1 (Critical)
**Tasks:** 0/73 complete  
**Estimated Time:** 14-18 hours  
**Status:** 🔴 Not Started

### Priority 2 (High)
**Tasks:** 0/25 complete  
**Estimated Time:** 7-9 hours  
**Status:** 🟠 Not Started

### Priority 3 (Medium)
**Tasks:** 0/15 complete  
**Estimated Time:** 11-13 hours  
**Status:** 🟡 Not Started

### Priority 4 (Low)
**Tasks:** 0/7 complete  
**Estimated Time:** 11-14 hours  
**Status:** 🔵 Not Started

### Testing & Documentation
**Tasks:** 0/27 complete  
**Estimated Time:** 6-8 hours  
**Status:** ⚪ Not Started

---

**Last Updated:** November 18, 2025  
**Next Review:** After Priority 1 completion  
**Blocking Issues:** None

