#!/bin/bash
# Test Runner Script for Teacher Interface & Enrollment Fixes
# Run all tests without cheating - real integration tests

set -e # Exit on any error

echo "🧪 Teacher Interface & Enrollment Fixes - Test Suite"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo -e "${RED}❌ ERROR: SUPABASE_URL not set${NC}"
  echo "Please set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${YELLOW}⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY not set${NC}"
  echo "Some tests may fail without service role key"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Run tests with coverage
echo "🏃 Running all tests..."
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Run API tests
echo "📡 Running API Tests..."
npm test -- api/*.test.ts --forceExit || TESTS_FAILED=$((TESTS_FAILED+1))
TESTS_PASSED=$((TESTS_PASSED+1))
echo ""

# Run security tests
echo "🔒 Running CRITICAL Security Tests..."
npm test -- api/teacher-security.test.ts --forceExit || TESTS_FAILED=$((TESTS_FAILED+1))
TESTS_PASSED=$((TESTS_PASSED+1))
echo ""

# Run notification tests
echo "🔔 Running Notification Tests..."
npm test -- lib/notifications.test.ts --forceExit || TESTS_FAILED=$((TESTS_FAILED+1))
TESTS_PASSED=$((TESTS_PASSED+1))
echo ""

# Run UI tests
echo "🎨 Running UI Component Tests..."
npm test -- client/src/**/*.test.tsx --forceExit || TESTS_FAILED=$((TESTS_FAILED+1))
TESTS_PASSED=$((TESTS_PASSED+1))
echo ""

# Display results
echo "===================================================="
echo "📊 Test Results Summary"
echo "===================================================="

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  echo ""
  echo "🎉 The implementation is working correctly!"
  echo "✅ Student enrollment system operational"
  echo "✅ Teacher security fix verified"
  echo "✅ Notifications system working"
  echo "✅ UI components functional"
  echo ""
  echo "Ready for deployment! 🚀"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo "Failed test suites: $TESTS_FAILED"
  echo ""
  echo "Please review the errors above and fix the code."
  echo "Remember: FIX THE CODE, NOT THE TESTS!"
  exit 1
fi

