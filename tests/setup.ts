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

// Mock resources for ResourceRecommender tests
export const mockResources = [
  {
    key: 'k12-curriculum',
    title: 'K-12 AI Curriculum',
    description: 'Comprehensive AI curriculum for K-12 education',
    category: 'Curriculum',
    categoryKey: 'curriculum',
    tags: ['K-12', 'Curriculum', 'AI Literacy'],
    difficulty: 'Beginner',
    lastUpdated: '2024',
    link: 'https://example.com/k12-curriculum'
  },
  {
    key: 'ai-teaching-guide',
    title: 'AI Teaching Guide',
    description: 'Beginner-friendly guide for teaching AI concepts',
    category: 'Guidelines',
    categoryKey: 'guidelines',
    tags: ['Teaching', 'AI Literacy', 'Beginner'],
    difficulty: 'Beginner',
    lastUpdated: '2024',
    link: 'https://example.com/teaching-guide'
  },
  {
    key: 'ml-educators',
    title: 'ML for Educators',
    description: 'Machine learning resources specifically for educators',
    category: 'Courses',
    categoryKey: 'courses',
    tags: ['Machine Learning', 'Higher Education', 'Professional Development'],
    difficulty: 'Intermediate',
    lastUpdated: '2025',
    link: 'https://example.com/ml-educators'
  },
  {
    key: 'advanced-ai-course',
    title: 'Advanced AI Implementation',
    description: 'Advanced course on AI implementation in educational settings',
    category: 'Courses',
    categoryKey: 'courses',
    tags: ['Advanced', 'Implementation', 'Higher Education'],
    difficulty: 'Advanced',
    lastUpdated: '2025',
    link: 'https://example.com/advanced-ai'
  },
  {
    key: 'middle-school-ai',
    title: 'Middle School AI Ethics',
    description: 'AI ethics curriculum designed for middle school students',
    category: 'Curriculum',
    categoryKey: 'curriculum',
    tags: ['6-8', 'Middle School', 'Ethics', 'AI Literacy'],
    difficulty: 'Intermediate',
    lastUpdated: '2024',
    link: 'https://example.com/middle-school-ai'
  }
];

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