# 🚀 Integration Test Quick Start

Get up and running in 5 minutes!

## Prerequisites

- Node.js installed
- Test Supabase project (NOT production!)
- Development server access

## Step 1: Environment (2 min)

```bash
# Copy template
cp .env.test.template .env.test

# Edit with your test credentials
nano .env.test
```

Add these values:
```env
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ SERVICE ROLE KEY!
SUPABASE_ANON_KEY=eyJhbGc...
API_BASE_URL=http://localhost:5173
```

## Step 2: Start Server (1 min)

```bash
# Terminal 1
npm run dev
```

Leave this running!

## Step 3: Run Test (2 min)

```bash
# Terminal 2
./tests/integration/run-integration-test.sh
```

## Expected Output

```
🧪 Integration Test Runner
==========================

✅ Environment file configured
✅ Dev server is running

🚀 Running integration test...

Phase 1: Setup and Authentication
  ✓ should create a teacher account
  ✓ should create multiple student accounts

Phase 2: Class Creation and Enrollment
  ✓ should allow teacher to create a class
  ✓ should allow all students to join simultaneously
  ✓ should reflect all students in roster
  ✓ should show class in student dashboards

Phase 3: Assignment Creation
  ✓ should allow teacher to create assignment
  ✓ should make assignment visible to students

Phase 4: Submissions
  ✓ should allow concurrent submissions

Phase 5: Analytics
  ✓ should provide accurate analytics
  ✓ should allow viewing all submissions
  ✓ should allow viewing submission details

Phase 6: Data Integrity
  ✓ should maintain referential integrity
  ✓ should have accurate timestamps

Phase 7: Summary
  ✓ should provide complete summary

📊 TEST SUMMARY
═══════════════════════════════════════════
Teacher: test-integration-teacher@test.com
Students: 10
Class: TEST-INT-AI Ethics (ABC123)
Assignment: TEST-INT-ASSIGN-Ethics Scenarios
Submissions: 10/10 (100%)
═══════════════════════════════════════════

🧹 Cleaning up test data...
✅ All test data cleaned up successfully

✅ Integration test passed!
```

## Troubleshooting

### ❌ "Dev server not running"
```bash
# Start it:
npm run dev
```

### ❌ "Invalid token" or "Authentication failed"
```bash
# Check you're using SERVICE ROLE KEY, not anon key!
echo $SUPABASE_SERVICE_ROLE_KEY
```

### ❌ Test timeout
```bash
# Edit tests/integration/setup.ts
# Increase DEFAULT_TIMEOUT: 60000
```

### ❌ Left over test data
```bash
# Manual cleanup:
npx ts-node tests/integration/cleanup-test-data.ts
```

## What It Tests

1. ✅ Teacher creates class
2. ✅ 10 students join simultaneously  
3. ✅ Teacher creates assignment
4. ✅ All students submit at once
5. ✅ Teacher views accurate analytics
6. ✅ All data is cleaned up

## Alternative Commands

```bash
# Manual run
npm test -- tests/integration/full-classroom-workflow.test.ts

# With verbose output
npm test -- tests/integration/full-classroom-workflow.test.ts --verbose

# Watch mode
npm test -- tests/integration/full-classroom-workflow.test.ts --watch
```

## Need Help?

See full documentation:
- `tests/integration/README.md` - Detailed guide
- `INTEGRATION_TEST_INFRASTRUCTURE.md` - Complete infrastructure docs

## Success! 🎉

If you see `✅ Integration test passed!` - you're all set!

The test validates your entire classroom workflow works correctly.

