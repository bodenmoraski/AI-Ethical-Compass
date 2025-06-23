import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClassDetailView from '../../client/src/components/teacher/ClassDetailView';

// Mock the API calls
jest.mock('../../client/src/lib/queryClient', () => ({
  queryClient: new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }),
}));

const mockClassData = {
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
  student_count: 25,
  assignment_count: 8,
  completion_rate: 78.5,
};

const mockStudents = [
  {
    id: 2,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    enrollment_date: new Date().toISOString(),
    status: 'active',
    completion_rate: 85.5,
    last_activity: new Date().toISOString(),
  },
  {
    id: 3,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    enrollment_date: new Date().toISOString(),
    status: 'active',
    completion_rate: 92.0,
    last_activity: new Date().toISOString(),
  },
];

const mockAssignments = [
  {
    id: 1,
    title: 'Ethics Scenario Analysis',
    description: 'Analyze various AI ethics scenarios',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 100,
    is_published: true,
    submission_count: 20,
    graded_count: 15,
  },
  {
    id: 2,
    title: 'Bias Detection Exercise',
    description: 'Identify and address bias in AI systems',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 150,
    is_published: false,
    submission_count: 0,
    graded_count: 0,
  },
];

// Mock fetch calls
global.fetch = jest.fn();

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ClassDetailView', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('Class Overview Section', () => {
    it('should display class information correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockClassData }),
      });

      renderWithProviders(<ClassDetailView classId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to AI Ethics')).toBeInTheDocument();
        expect(screen.getByText('AIETHICS2024')).toBeInTheDocument();
        expect(screen.getByText('25 Students')).toBeInTheDocument();
        expect(screen.getByText('8 Assignments')).toBeInTheDocument();
        expect(screen.getByText('78.5%')).toBeInTheDocument();
      });
    });

    it('should show edit class button for class owner', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockClassData }),
      });

      renderWithProviders(<ClassDetailView classId="1" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit class/i })).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<ClassDetailView classId="1" />);

      expect(screen.getByTestId('class-detail-loading')).toBeInTheDocument();
    });
  });

  describe('Students Tab', () => {
    beforeEach(() => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockClassData }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockStudents, total: 2 }),
        });
    });

    it('should display student list when Students tab is selected', async () => {
      renderWithProviders(<ClassDetailView classId="1" />);

      // Wait for the class data to load first
      await waitFor(() => {
        expect(screen.getByText('Introduction to AI Ethics')).toBeInTheDocument();
      });

      const studentsTab = screen.getByRole('tab', { name: /students/i });
      fireEvent.click(studentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        expect(screen.getByText('85.5%')).toBeInTheDocument();
        expect(screen.getByText('92.0%')).toBeInTheDocument();
      });
    });

    it('should show add student button', async () => {
      renderWithProviders(<ClassDetailView classId="1" />);

      // Wait for the class data to load first
      await waitFor(() => {
        expect(screen.getByText('Introduction to AI Ethics')).toBeInTheDocument();
      });

      const studentsTab = screen.getByRole('tab', { name: /students/i });
      fireEvent.click(studentsTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add student/i })).toBeInTheDocument();
      });
    });

    it('should filter students by search query', async () => {
      renderWithProviders(<ClassDetailView classId="1" />);

      const studentsTab = screen.getByRole('tab', { name: /students/i });
      fireEvent.click(studentsTab);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search students/i);
        fireEvent.change(searchInput, { target: { value: 'john' } });
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('Assignments Tab', () => {
    beforeEach(() => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockClassData }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockAssignments, total: 2 }),
        });
    });

    it('should display assignment list when Assignments tab is selected', async () => {
      renderWithProviders(<ClassDetailView classId="1" />);

      const assignmentsTab = screen.getByRole('tab', { name: /assignments/i });
      fireEvent.click(assignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('Ethics Scenario Analysis')).toBeInTheDocument();
        expect(screen.getByText('Bias Detection Exercise')).toBeInTheDocument();
      });
    });

    it('should show published status for assignments', async () => {
      renderWithProviders(<ClassDetailView classId="1" />);

      const assignmentsTab = screen.getByRole('tab', { name: /assignments/i });
      fireEvent.click(assignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('Published')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();
      });
    });

    it('should show create assignment button', async () => {
      renderWithProviders(<ClassDetailView classId="1" />);

      const assignmentsTab = screen.getByRole('tab', { name: /assignments/i });
      fireEvent.click(assignmentsTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create assignment/i })).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Tab', () => {
    it('should display analytics when Analytics tab is selected', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockClassData }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: {
              engagement_trends: [
                { date: '2024-01-01', engagement_score: 0.85 },
                { date: '2024-01-02', engagement_score: 0.78 },
              ],
              completion_rates: {
                total: 78.5,
                by_assignment: [
                  { assignment_id: 1, completion_rate: 85.0 },
                  { assignment_id: 2, completion_rate: 72.0 },
                ],
              },
            }
          }),
        });

      renderWithProviders(<ClassDetailView classId="1" />);

      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      fireEvent.click(analyticsTab);

      await waitFor(() => {
        expect(screen.getByText('Engagement Trends')).toBeInTheDocument();
        expect(screen.getByText('Completion Rates')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when class fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

      renderWithProviders(<ClassDetailView classId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/error loading class/i)).toBeInTheDocument();
      });
    });

    it('should display not found message for non-existent class', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Class not found' }),
      });

      renderWithProviders(<ClassDetailView classId="999" />);

      await waitFor(() => {
        expect(screen.getByText(/class not found/i)).toBeInTheDocument();
      });
    });
  });
}); 