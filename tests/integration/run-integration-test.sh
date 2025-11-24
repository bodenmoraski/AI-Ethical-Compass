#!/bin/bash

# Integration Test Runner
# This script runs the full classroom integration test with proper setup

set -e  # Exit on error

echo "🧪 Integration Test Runner"
echo "=========================="
echo ""

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "❌ Error: .env.test file not found"
    echo ""
    echo "Please create .env.test from the template:"
    echo "  cp .env.test.template .env.test"
    echo ""
    echo "Then fill in your test environment values."
    exit 1
fi

# Check if SUPABASE_URL is set
if ! grep -q "SUPABASE_URL=your-" .env.test 2>/dev/null; then
    echo "✅ Environment file configured"
else
    echo "⚠️  Warning: .env.test appears to contain template values"
    echo "   Please update with your actual test environment values"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if dev server is running
echo "🔍 Checking if dev server is running..."
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo ""
    echo "⚠️  Warning: Dev server doesn't appear to be running"
    echo ""
    echo "The integration tests need the API server to be running."
    echo "Please start it in another terminal:"
    echo ""
    echo "  npm run dev"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Dev server is running"
fi

# Run the test
echo ""
echo "🚀 Running integration test..."
echo ""

# Set NODE_OPTIONS to increase memory if needed
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the specific integration test with verbose output
npx jest tests/integration/full-classroom-workflow.test.ts \
    --verbose \
    --detectOpenHandles \
    --forceExit \
    --runInBand

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Integration test passed!"
else
    echo "❌ Integration test failed (exit code: $TEST_EXIT_CODE)"
    echo ""
    echo "Check the output above for details."
    echo ""
    echo "Common issues:"
    echo "  - Dev server not running"
    echo "  - Incorrect environment variables in .env.test"
    echo "  - Database migrations not applied"
    echo "  - Missing test scenarios in database"
fi

exit $TEST_EXIT_CODE

