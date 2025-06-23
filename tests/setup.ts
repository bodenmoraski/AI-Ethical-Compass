import { config } from 'dotenv';
import '@testing-library/jest-dom';

// Load test environment variables
config({ path: '.env.test' });

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

jest.mock('../lib/supabase-server', () => ({
  getSupabaseClient: jest.fn().mockReturnValue(mockSupabaseClient),
}));

// Global test utilities and mock data
declare global {
  var mockUser: any;
  var mockStudent: any;
  var mockClass: any;
  var mockSupabaseClient: any;
}

global.mockUser = {
  id: 1,
  email: 'teacher@example.com',
  user_type: 'teacher',
  first_name: 'Test',
  last_name: 'Teacher',
  school_name: 'Test School',
  department: 'Computer Science',
  created_at: new Date().toISOString(),
};

global.mockStudent = {
  id: 2,
  email: 'student@example.com',
  user_type: 'student',
  first_name: 'Test',
  last_name: 'Student',
  created_at: new Date().toISOString(),
};

global.mockClass = {
  id: 1,
  name: 'Introduction to AI Ethics',
  description: 'A comprehensive course on ethical AI principles',
  teacher_id: 1,
  school_year: '2024',
  semester: 'Fall',
  subject: 'Computer Science',
  grade_level: '12',
  class_code: 'AIETHICS2024',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

global.mockSupabaseClient = mockSupabaseClient;

// Cleanup function for tests
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 