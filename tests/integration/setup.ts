import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.test' });

// Ensure required environment variables are set
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test configuration
export const TEST_CONFIG = {
  // Use unique prefixes to identify test data
  TEST_EMAIL_PREFIX: 'test-integration-',
  TEST_CLASS_PREFIX: 'TEST-INT-',
  TEST_ASSIGNMENT_PREFIX: 'TEST-INT-ASSIGN-',
  
  // Test user credentials
  TEST_PASSWORD: 'TestPassword123!',
  
  // API configuration
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  
  // Test timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  CLEANUP_TIMEOUT: 60000, // 60 seconds
  
  // Number of concurrent students to simulate
  DEFAULT_STUDENT_COUNT: 10,
};

// Global test state tracking
export const testState = {
  createdUsers: [] as string[], // User IDs to cleanup
  createdClasses: [] as number[], // Class IDs to cleanup
  createdAssignments: [] as number[], // Assignment IDs to cleanup
  createdEnrollments: [] as number[], // Enrollment IDs to cleanup
  createdSubmissions: [] as number[], // Submission IDs to cleanup
};

// Add to tracking
export function trackUser(userId: string) {
  testState.createdUsers.push(userId);
}

export function trackClass(classId: number) {
  testState.createdClasses.push(classId);
}

export function trackAssignment(assignmentId: number) {
  testState.createdAssignments.push(assignmentId);
}

export function trackEnrollment(enrollmentId: number) {
  testState.createdEnrollments.push(enrollmentId);
}

export function trackSubmission(submissionId: number) {
  testState.createdSubmissions.push(submissionId);
}

// Reset tracking
export function resetTestState() {
  testState.createdUsers = [];
  testState.createdClasses = [];
  testState.createdAssignments = [];
  testState.createdEnrollments = [];
  testState.createdSubmissions = [];
}

// Utility to wait for database operations to complete
export async function waitForDb(ms: number = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility to retry operations with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await waitForDb(delayMs * Math.pow(2, i));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

