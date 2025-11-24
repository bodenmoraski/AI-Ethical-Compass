# 🧪 Full Classroom Integration Tests

This directory contains **true integration tests** that simulate real classroom scenarios on the platform. These tests use real Supabase authentication, real API calls, and a real database - no mocking.

## 🎯 What This Tests

The full classroom workflow integration test simulates:

1. **Teacher Account Creation** - Real Supabase auth user creation
2. **Multiple Student Accounts** - 10 concurrent student registrations
3. **Class Creation** - Teacher creates a class with a class code
4. **Mass Enrollment** - All students join simultaneously using the class code
5. **Assignment Creation** - Teacher creates and publishes an assignment
6. **Concurrent Submissions** - All students submit work at the same time
7. **Analytics Verification** - Teacher views accurate analytics
8. **Submission Review** - Teacher can access all student submissions

## 📋 Prerequisites

### 1. Environment Setup

Create a `.env.test` file in the project root:

```bash
cp .env.test.template .env.test
```

Fill in your test environment values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=http://localhost:5173
```

⚠️ **IMPORTANT**: Use a test/development Supabase project, NOT production!

### 2. Database Migrations

Ensure all migrations are applied:

```bash
npm run db:push
```

### 3. Development Server

The integration tests make HTTP requests to your API, so you need the dev server running:

```bash
# Terminal 1: Start the development server
npm run dev
```

### 4. Test Scenarios

Ensure you have at least 3 scenarios in your database (the test uses scenarios 1, 2, 3).

## 🚀 Running the Tests

### Run Integration Tests Only

```bash
npm test -- tests/integration/full-classroom-workflow.test.ts
```

### Run with Verbose Output

```bash
npm test -- tests/integration/full-classroom-workflow.test.ts --verbose
```

### Run with Coverage

```bash
npm test -- tests/integration/full-classroom-workflow.test.ts --coverage
```

### Watch Mode (for development)

```bash
npm test -- tests/integration/full-classroom-workflow.test.ts --watch
```

## 📊 Test Phases

The test is organized into 7 phases:

### Phase 1: Setup and Authentication
- Creates 1 teacher account
- Creates 10 student accounts concurrently
- Verifies all authentication tokens

### Phase 2: Class Creation and Enrollment
- Teacher creates a class
- All students join simultaneously
- Verifies roster accuracy

### Phase 3: Assignment Creation and Distribution
- Teacher creates assignment with scenarios
- Verifies all students can see it

### Phase 4: Concurrent Student Submissions
- All 10 students submit simultaneously
- Verifies all submissions succeed
- Checks submission data integrity

### Phase 5: Teacher Analytics and Grading
- Teacher views analytics (completion rate, avg time, etc.)
- Teacher views all submissions
- Teacher views individual submission details

### Phase 6: Data Integrity Verification
- Verifies referential integrity
- Checks timestamp accuracy
- Validates foreign key relationships

### Phase 7: Summary and Verification
- Prints test summary
- Final verification

## 🔧 Configuration

### Adjust Student Count

In `tests/integration/setup.ts`, modify:

```typescript
DEFAULT_STUDENT_COUNT: 10, // Change this value
```

### Adjust Timeouts

```typescript
DEFAULT_TIMEOUT: 30000, // 30 seconds
CLEANUP_TIMEOUT: 60000, // 60 seconds
```

### Test Data Prefixes

All test data is prefixed to make cleanup easy:

```typescript
TEST_EMAIL_PREFIX: 'test-integration-',
TEST_CLASS_PREFIX: 'TEST-INT-',
TEST_ASSIGNMENT_PREFIX: 'TEST-INT-ASSIGN-',
```

## 🧹 Data Cleanup

The test automatically cleans up all test data after completion:

1. **Automatic Cleanup** - Runs in `afterAll()` hook
2. **Tracked Cleanup** - Uses test state tracking
3. **Prefix-Based Cleanup** - Fallback method using prefixes

### Manual Cleanup

If a test fails and doesn't clean up:

```typescript
// In the test file or a separate script
import { cleanupByPrefix } from './helpers/cleanup-helpers';

await cleanupByPrefix();
```

### Verify Cleanup

```typescript
import { verifyCleanup } from './helpers/cleanup-helpers';

const result = await verifyCleanup();
console.log('Remaining test data:', result.remainingData);
```

## 📁 File Structure

```
tests/integration/
├── README.md                           # This file
├── setup.ts                            # Test configuration and utilities
├── full-classroom-workflow.test.ts     # Main integration test
└── helpers/
    ├── auth-helpers.ts                 # User creation and authentication
    ├── api-helpers.ts                  # API request helpers
    └── cleanup-helpers.ts              # Data cleanup utilities
```

## ✅ Expected Output

When the test runs successfully, you'll see:

```
🚀 Setting up full classroom integration test...

Phase 1: Setup and Authentication
  ✓ should create a teacher account with valid authentication
  ✓ should create multiple student accounts concurrently

Phase 2: Class Creation and Enrollment
  ✓ should allow teacher to create a class with class code
  ✓ should allow all students to join the class simultaneously
  ✓ should reflect all students in teacher's class roster
  ✓ should show the class in each student's enrolled classes

Phase 3: Assignment Creation and Distribution
  ✓ should allow teacher to create and publish an assignment
  ✓ should make the assignment visible to all enrolled students

Phase 4: Concurrent Student Submissions
  ✓ should allow all students to submit the assignment simultaneously

Phase 5: Teacher Analytics and Grading
  ✓ should provide accurate analytics to the teacher
  ✓ should allow teacher to view all submissions
  ✓ should allow teacher to view individual submission details

Phase 6: Data Integrity Verification
  ✓ should maintain referential integrity across all entities
  ✓ should have accurate timestamps and ordering

Phase 7: Summary and Verification
  ✓ should provide a complete test summary

📊 TEST SUMMARY
═══════════════════════════════════════════════════
Teacher: test-integration-teacher-0@test.com
Students Created: 10
Class: TEST-INT-AI Ethics (ABC123)
Assignment: TEST-INT-ASSIGN-Ethics Scenarios
Submissions: 10/10 (100%)
═══════════════════════════════════════════════════

🧹 Cleaning up test data...
✅ All test data cleaned up successfully

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

## 🐛 Troubleshooting

### Authentication Errors

If you see "Invalid or expired token":
- Check your `SUPABASE_SERVICE_ROLE_KEY` in `.env.test`
- Ensure it's the **service role key**, not the anon key
- Verify the Supabase project is active

### API Connection Errors

If you see "Failed to connect" or "ECONNREFUSED":
- Ensure dev server is running (`npm run dev`)
- Check `API_BASE_URL` in `.env.test`
- Verify the port matches your dev server

### Database Errors

If you see foreign key constraint errors:
- Ensure all migrations are applied
- Check that scenarios 1, 2, 3 exist in your database
- Verify RLS policies allow service role access

### Cleanup Errors

If test data isn't cleaned up:
- Run manual cleanup: `await cleanupByPrefix()`
- Check for foreign key constraints blocking deletion
- Verify service role key has delete permissions

### Timeout Errors

If tests timeout:
- Increase `DEFAULT_TIMEOUT` in `setup.ts`
- Check your internet connection (for Supabase API calls)
- Reduce `DEFAULT_STUDENT_COUNT` for faster tests

## 🎓 Understanding the Test

### Why This Matters

This test validates the **entire user journey** in a way that unit tests cannot:

1. **Real Authentication Flow** - Tests actual JWT token generation and validation
2. **Concurrent Operations** - Verifies the system handles multiple users simultaneously
3. **Data Consistency** - Ensures referential integrity across related entities
4. **API Integration** - Tests actual HTTP request/response cycles
5. **Race Conditions** - Identifies concurrency issues that mocks would hide

### What Makes This Different

Most tests mock the database and API calls. This test:
- ✅ Creates real users in Supabase Auth
- ✅ Makes real HTTP requests to API endpoints
- ✅ Writes and reads from real database
- ✅ Simulates concurrent user actions
- ✅ Verifies actual data consistency

## 🚀 Next Steps

### Extend the Test

You can add more phases to test:

- **Teacher grading workflow** - Grade submissions and verify scores
- **Student viewing grades** - Students check their grades
- **Late submissions** - Test late submission penalties
- **Assignment editing** - Teacher modifies published assignment
- **Student unenrollment** - Students leave class
- **Class deletion** - Teacher deletes class with cleanup

### Create Similar Tests

Use this as a template for other workflows:
- Discussion thread participation
- Resource recommendation flow
- Notification delivery and reading
- Progress tracking across scenarios

## 📝 Notes

- Test uses real resources (database, auth) - expect ~30-60 seconds runtime
- Cleanup is automatic but can be manually triggered if needed
- All test data uses unique prefixes for easy identification
- Failed tests may leave data behind - use manual cleanup
- This test should be run in CI/CD on test environment only

## 🤝 Contributing

When modifying this test:

1. Maintain the phase structure
2. Add cleanup for any new entities
3. Update this README with changes
4. Test both success and failure scenarios
5. Ensure cleanup runs even if test fails

