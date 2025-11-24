# 🔄 Integration Test Flow Diagram

Visual representation of the full classroom integration test workflow.

---

## 📋 Test Flow Overview

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    INTEGRATION TEST START                                 ║
╚══════════════════════════════════════════════════════════════════════════╝
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: AUTHENTICATION & SETUP                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Teacher                           Students (x10)                        │
│  ┌────────┐                       ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ CREATE │                       │ CREATE │ │ CREATE │ │ CREATE │ ...│
│  │  USER  │────────────────┬─────▶│  USER  │ │  USER  │ │  USER  │    │
│  └────────┘                │      └────────┘ └────────┘ └────────┘    │
│      │                     │           │          │          │         │
│      │                     │      ┌────▼──────────▼──────────▼──────┐  │
│      │                     └─────▶│   CONCURRENT CREATION (10x)     │  │
│      │                            └──────────────┬──────────────────┘  │
│      ▼                                           ▼                      │
│  ┌────────────┐                          ┌────────────┐                │
│  │ GET TOKEN  │                          │ GET TOKENS │                │
│  │ (JWT)      │                          │ (JWT x10)  │                │
│  └────────────┘                          └────────────┘                │
│                                                                          │
│  ✓ 1 Teacher created with valid JWT                                    │
│  ✓ 10 Students created with valid JWTs                                 │
│  ✓ All tokens validated                                                │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: CLASS CREATION & MASS ENROLLMENT                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Teacher                                                                 │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ POST /api/teacher?action=classes                     │               │
│  │ {                                                    │               │
│  │   name: "AI Ethics Full Test",                      │               │
│  │   subject: "Computer Science",                      │               │
│  │   grade_level: "12"                                 │               │
│  │ }                                                    │               │
│  └──────────────────────────────────────────────────────┘               │
│                           │                                              │
│                           ▼                                              │
│                  ┌─────────────────┐                                    │
│                  │ CLASS CREATED   │                                    │
│                  │ Code: ABC123    │                                    │
│                  └─────────────────┘                                    │
│                           │                                              │
│        ┌──────────────────┼──────────────────┐                          │
│        │                  │                  │                          │
│   Student 1          Student 2         Student 3 ...                    │
│   ┌────────┐         ┌────────┐         ┌────────┐                     │
│   │ POST   │         │ POST   │         │ POST   │                     │
│   │ /api/  │         │ /api/  │         │ /api/  │                     │
│   │student │         │student │         │student │                     │
│   │{ABC123}│         │{ABC123}│         │{ABC123}│                     │
│   └────────┘         └────────┘         └────────┘                     │
│        │                  │                  │                          │
│        └──────────────────┼──────────────────┘                          │
│                           ▼                                              │
│                  ┌─────────────────┐                                    │
│                  │ ALL ENROLLED    │                                    │
│                  │ (10/10)         │                                    │
│                  └─────────────────┘                                    │
│                                                                          │
│  ✓ Class created with unique code                                      │
│  ✓ All 10 students joined simultaneously                               │
│  ✓ Roster shows all 10 students                                        │
│  ✓ Each student sees class in dashboard                                │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: ASSIGNMENT CREATION & DISTRIBUTION                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Teacher                                                                 │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ POST /api/teacher?action=assignments                 │               │
│  │ {                                                    │               │
│  │   class_id: 1,                                      │               │
│  │   title: "Ethics Scenarios",                        │               │
│  │   scenario_ids: [1, 2, 3],                          │               │
│  │   points_possible: 100,                             │               │
│  │   is_published: true                                │               │
│  │ }                                                    │               │
│  └──────────────────────────────────────────────────────┘               │
│                           │                                              │
│                           ▼                                              │
│                  ┌─────────────────┐                                    │
│                  │ ASSIGNMENT      │                                    │
│                  │ PUBLISHED       │                                    │
│                  └─────────────────┘                                    │
│                           │                                              │
│        ┌──────────────────┼──────────────────┐                          │
│        │                  │                  │                          │
│        ▼                  ▼                  ▼                          │
│   Student 1          Student 2         Student 3 ...                    │
│   ┌────────┐         ┌────────┐         ┌────────┐                     │
│   │ CAN    │         │ CAN    │         │ CAN    │                     │
│   │ VIEW   │         │ VIEW   │         │ VIEW   │                     │
│   │ASSIGNMT│         │ASSIGNMT│         │ASSIGNMT│                     │
│   └────────┘         └────────┘         └────────┘                     │
│                                                                          │
│  ✓ Assignment created with 3 scenarios                                 │
│  ✓ Published to entire class                                           │
│  ✓ All 10 students can see assignment                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: CONCURRENT STUDENT SUBMISSIONS                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Student 1           Student 2           Student 3          Student 4   │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐       ┌────────┐│
│  │ POST     │        │ POST     │        │ POST     │       │ POST   ││
│  │/api/user-│        │/api/user-│        │/api/user-│       │/api/user││
│  │dashboard │        │dashboard │        │dashboard │       │dashboard││
│  │{         │        │{         │        │{         │       │{       ││
│  │ assignmt │        │ assignmt │        │ assignmt │       │ assignmt││
│  │ perspecv │        │ perspecv │        │ perspecv │       │ perspecv││
│  │ time: 18 │        │ time: 25 │        │ time: 22 │       │ time:15││
│  │}         │        │}         │        │}         │       │}       ││
│  └──────────┘        └──────────┘        └──────────┘       └────────┘│
│       │                   │                   │                  │      │
│       │                   │                   │                  │      │
│       └───────────────────┼───────────────────┼──────────────────┘      │
│                           │    ... x10 ...    │                         │
│                           ▼                   ▼                         │
│                  ┌──────────────────────────────┐                       │
│                  │ ALL SUBMISSIONS RECORDED     │                       │
│                  │ Promise.allSettled([...])    │                       │
│                  │ Results: 10 fulfilled        │                       │
│                  └──────────────────────────────┘                       │
│                                                                          │
│  ✓ All 10 students submitted simultaneously                            │
│  ✓ Each submission has unique perspective                              │
│  ✓ Time spent varies (15-35 minutes)                                   │
│  ✓ All submissions successful (0 failures)                             │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: TEACHER ANALYTICS & REVIEW                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Teacher Requests Analytics                                             │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ GET /api/teacher?action=assignment-analytics         │               │
│  │                ?assignmentId=123                     │               │
│  └──────────────────────────────────────────────────────┘               │
│                           │                                              │
│                           ▼                                              │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ ANALYTICS RESPONSE                                   │               │
│  │ {                                                    │               │
│  │   totalStudents: 10,                                │               │
│  │   submittedCount: 10,                               │               │
│  │   completionRate: 100%,                             │               │
│  │   averageScore: 0,                                  │               │
│  │   averageTimeSpent: 22.3 minutes,                   │               │
│  │   studentProgress: [                                │               │
│  │     { student_id: 1, status: 'submitted', ... },    │               │
│  │     { student_id: 2, status: 'submitted', ... },    │               │
│  │     ...                                             │               │
│  │   ]                                                  │               │
│  │ }                                                    │               │
│  └──────────────────────────────────────────────────────┘               │
│                           │                                              │
│                           ▼                                              │
│  Teacher Views All Submissions                                          │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ GET /api/teacher?action=assignment-submissions       │               │
│  └──────────────────────────────────────────────────────┘               │
│                           │                                              │
│                           ▼                                              │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ [                                                    │               │
│  │   { id: 1, student_id: 2, perspectives: [...] },    │               │
│  │   { id: 2, student_id: 5, perspectives: [...] },    │               │
│  │   ... (10 total)                                    │               │
│  │ ]                                                    │               │
│  └──────────────────────────────────────────────────────┘               │
│                           │                                              │
│                           ▼                                              │
│  Teacher Views Individual Submission Details                            │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ GET /api/teacher?action=submission-detail            │               │
│  │                 &submissionId=1                      │               │
│  └──────────────────────────────────────────────────────┘               │
│                           │                                              │
│                           ▼                                              │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ {                                                    │               │
│  │   id: 1,                                            │               │
│  │   student: "Student Test1",                         │               │
│  │   submission_data: {                                │               │
│  │     perspectives: ["Full ethical analysis..."],     │               │
│  │     answers: {...},                                 │               │
│  │     timeSpent: 18                                   │               │
│  │   }                                                  │               │
│  │ }                                                    │               │
│  └──────────────────────────────────────────────────────┘               │
│                                                                          │
│  ✓ Analytics accurate (100% completion)                                │
│  ✓ All 10 submissions visible                                          │
│  ✓ Detailed content readable                                           │
│  ✓ Average time calculated correctly                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: DATA INTEGRITY VERIFICATION                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Referential Integrity Check                                            │
│  ┌──────────────────────────────────────────────────────┐               │
│  │  ┌──────────┐     ┌──────────────┐    ┌──────────┐ │               │
│  │  │ TEACHER  │────▶│  CLASS       │───▶│ASSIGNMNT │ │               │
│  │  │  id: 1   │     │  teacher:1   │    │ class:1  │ │               │
│  │  └──────────┘     └──────────────┘    └──────────┘ │               │
│  │                            │                │        │               │
│  │                            ▼                ▼        │               │
│  │                    ┌──────────────┐  ┌───────────┐  │               │
│  │                    │ ENROLLMENTS  │  │SUBMISSION │  │               │
│  │                    │ class_id: 1  │  │assign: 1  │  │               │
│  │                    │ student: 2-11│  │student:2  │  │               │
│  │                    └──────────────┘  └───────────┘  │               │
│  └──────────────────────────────────────────────────────┘               │
│                                                                          │
│  Timestamp Validation                                                   │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ All submissions:                                     │               │
│  │  ✓ Have submitted_at timestamp                      │               │
│  │  ✓ Timestamps within last 5 minutes                 │               │
│  │  ✓ Timestamps not in future                         │               │
│  │  ✓ Ordered correctly                                │               │
│  └──────────────────────────────────────────────────────┘               │
│                                                                          │
│  ✓ All foreign keys valid                                              │
│  ✓ No orphaned records                                                 │
│  ✓ Timestamps accurate                                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: AUTOMATIC CLEANUP                                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Cleanup Order (respects foreign key dependencies)                      │
│                                                                          │
│  Step 1: Delete Submissions                                             │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ DELETE FROM assignment_submissions                   │               │
│  │ WHERE id IN (testState.createdSubmissions)           │               │
│  │ → 10 submissions deleted                             │               │
│  └──────────────────────────────────────────────────────┘               │
│                           ↓                                              │
│  Step 2: Delete Assignments                                             │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ DELETE FROM assignments                              │               │
│  │ WHERE id IN (testState.createdAssignments)           │               │
│  │ → 1 assignment deleted                               │               │
│  └──────────────────────────────────────────────────────┘               │
│                           ↓                                              │
│  Step 3: Delete Enrollments                                             │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ DELETE FROM class_enrollments                        │               │
│  │ WHERE id IN (testState.createdEnrollments)           │               │
│  │ → 10 enrollments deleted                             │               │
│  └──────────────────────────────────────────────────────┘               │
│                           ↓                                              │
│  Step 4: Delete Classes                                                 │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ DELETE FROM classes                                  │               │
│  │ WHERE id IN (testState.createdClasses)               │               │
│  │ → 1 class deleted                                    │               │
│  └──────────────────────────────────────────────────────┘               │
│                           ↓                                              │
│  Step 5: Delete User Profiles                                           │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ DELETE FROM users                                    │               │
│  │ WHERE id IN (testState.createdUsers)                 │               │
│  │ → 11 user profiles deleted                           │               │
│  └──────────────────────────────────────────────────────┘               │
│                           ↓                                              │
│  Step 6: Delete Auth Users                                              │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ FOR EACH userId IN testState.createdUsers            │               │
│  │   supabase.auth.admin.deleteUser(userId)             │               │
│  │ → 11 auth users deleted                              │               │
│  └──────────────────────────────────────────────────────┘               │
│                           ↓                                              │
│  ┌──────────────────────────────────────────────────────┐               │
│  │ ✅ ALL TEST DATA CLEANED UP                          │               │
│  └──────────────────────────────────────────────────────┘               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
╔══════════════════════════════════════════════════════════════════════════╗
║                      TEST COMPLETE ✅                                    ║
║                                                                          ║
║  Duration: ~25-35 seconds                                               ║
║  Tests Passed: 15/15                                                    ║
║  Users Created: 11                                                      ║
║  Submissions: 10/10                                                     ║
║  Completion: 100%                                                       ║
║  Data Cleaned: ✅                                                       ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔍 Key Characteristics

### Concurrent Operations
- Students join class **simultaneously** (not sequentially)
- Students submit assignments **at the same time**
- Tests real system load handling

### Real Integration
- No mocks or stubs
- Actual HTTP requests
- Real database operations
- Genuine JWT authentication

### Complete Workflow
- Full end-to-end user journey
- Teacher and student perspectives
- Creation, usage, and cleanup

### Data Integrity
- Referential integrity validated
- Foreign keys checked
- Timestamps verified
- No orphaned data

---

## 📊 Test Metrics

| Metric | Value |
|--------|-------|
| Total Test Phases | 7 |
| Total Test Cases | 15 |
| Users Created | 11 (1 teacher + 10 students) |
| Concurrent Operations | 20+ (joins + submissions) |
| API Calls Made | 40+ |
| Database Operations | 50+ |
| Expected Runtime | 20-35 seconds |
| Cleanup Operations | 6 steps |

---

## 🎯 What This Proves

When this test passes, you can be confident that:

✅ Your authentication system works  
✅ Your API endpoints handle concurrent requests  
✅ Your database maintains data integrity  
✅ Your class enrollment flow is functional  
✅ Your assignment system works end-to-end  
✅ Your analytics are accurate  
✅ Your cleanup processes work correctly  

**This is real-world validation, not theoretical testing.**

