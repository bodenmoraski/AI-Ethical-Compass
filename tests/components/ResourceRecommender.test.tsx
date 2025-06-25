import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceRecommender from '../../client/src/components/ResourceRecommender';
import { mockResources } from '../setup';

// Mock UI components
jest.mock('../../client/src/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={`badge ${className}`}>{children}</span>
}));

jest.mock('../../client/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={`btn ${className}`} {...props}>
      {children}
    </button>
  )
}));

const mockOnApplyFilters = jest.fn();

describe('ResourceRecommender', () => {
  beforeEach(() => {
    mockOnApplyFilters.mockClear();
  });

  it('renders the search bar prompt correctly', () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    expect(screen.getByText('Not sure where to start?')).toBeInTheDocument();
    expect(screen.getByText('Take our quick quiz to get personalized resource recommendations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Recommendations' })).toBeInTheDocument();
  });

  it('opens modal when Get Recommendations button is clicked', () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    expect(screen.getByText('Get Personalized Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Answer a few quick questions to find resources tailored to your needs')).toBeInTheDocument();
  });

  it('closes modal when X button is clicked', () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    fireEvent.click(screen.getByLabelText('Close recommendations'));
    
    expect(screen.queryByText('Get Personalized Recommendations')).not.toBeInTheDocument();
  });

  it('renders all form fields correctly', () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    expect(screen.getByLabelText(/What's your role or grade level/)).toBeInTheDocument();
    expect(screen.getByLabelText(/What's your main goal/)).toBeInTheDocument();
    expect(screen.getByText(/How familiar are you with AI in education/)).toBeInTheDocument();
    expect(screen.getByText(/Any specific topics of interest/)).toBeInTheDocument();
  });

  it('shows Get My Recommendations button when form has answers', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    // Initially no button should be visible
    expect(screen.queryByRole('button', { name: 'Get My Recommendations' })).not.toBeInTheDocument();
    
    // Select a grade level
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    // Now the button should appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
  });

  it('does not show recommendations initially', () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    expect(screen.queryByText('Your Personalized Recommendations')).not.toBeInTheDocument();
  });

  it('shows recommendations after clicking Get My Recommendations button', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    // Select a grade level
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    // Now recommendations should appear
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
  });

  it('updates grade level selection correctly', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    expect(gradeSelect).toHaveValue('K-5');
  });

  it('updates goal selection correctly', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const goalSelect = screen.getByLabelText(/What's your main goal/);
    fireEvent.change(goalSelect, { target: { value: 'ai-literacy' } });
    
    expect(goalSelect).toHaveValue('ai-literacy');
  });

  it('updates experience level selection correctly', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const beginnerRadio = screen.getByRole('radio', { name: 'Beginner' });
    fireEvent.click(beginnerRadio);
    
    expect(beginnerRadio).toBeChecked();
  });

  it('updates topic selections correctly', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    // Find and click a topic checkbox (using a specific topic from mock resources)
    const curriculumCheckbox = screen.getByDisplayValue('Curriculum');
    fireEvent.click(curriculumCheckbox);
    
    expect(curriculumCheckbox).toBeChecked();
  });

  it('provides relevant recommendations based on grade level', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
    
    // Should show K-12 Curriculum resource since it matches K-5
    expect(screen.getByText('K-12 AI Curriculum')).toBeInTheDocument();
  });

  it('provides relevant recommendations based on goal', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const goalSelect = screen.getByLabelText(/What's your main goal/);
    fireEvent.change(goalSelect, { target: { value: 'ai-literacy' } });
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
    
    // Should show curriculum-related resources
    const curriculumResource = screen.getByText('K-12 AI Curriculum');
    expect(curriculumResource).toBeInTheDocument();
  });

  it('provides relevant recommendations based on experience level', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const beginnerRadio = screen.getByRole('radio', { name: 'Beginner' });
    fireEvent.click(beginnerRadio);
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
    
    // Should show beginner-level resources
    expect(screen.getByText('AI Teaching Guide')).toBeInTheDocument();
  });

  it('provides relevant recommendations based on topic selection', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    // Find and click the "Machine Learning" topic if available
    const mlCheckbox = screen.getByDisplayValue('Machine Learning');
    fireEvent.click(mlCheckbox);
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
    
    // Should show ML-related resources
    expect(screen.getByText('ML for Educators')).toBeInTheDocument();
  });

  it('shows no recommendations message when no matches found', async () => {
    // Create a resource set that won't match our selections
    const noMatchResources = [
      {
        key: 'no-match',
        title: 'Unrelated Resource',
        description: 'This resource has no matching tags or categories',
        link: 'https://example.com',
        category: 'Other',
        categoryKey: 'other',
        difficulty: 'Expert',
        tags: ['unrelated', 'nomatch'],
        lastUpdated: '2020'
      }
    ];
    
    render(<ResourceRecommender resources={noMatchResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('No resources match your specific criteria.')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: 'Try different selections' })).toBeInTheDocument();
  });

  it('calls onApplyFilters with correct parameters when See all matching resources is clicked', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const goalSelect = screen.getByLabelText(/What's your main goal/);
    fireEvent.change(goalSelect, { target: { value: 'ai-literacy' } });
    
    const beginnerRadio = screen.getByRole('radio', { name: 'Beginner' });
    fireEvent.click(beginnerRadio);
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
    
    const seeAllButton = screen.getByRole('button', { name: 'See all matching resources' });
    fireEvent.click(seeAllButton);
    
    expect(mockOnApplyFilters).toHaveBeenCalledWith({
      category: 'courses',
      difficulty: 'Beginner',
      tags: []
    });
  });

  it('resets form when Start over button is clicked', async () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
    
    const startOverButton = screen.getByRole('button', { name: 'Start over' });
    fireEvent.click(startOverButton);
    
    // Form should be reset
    expect(gradeSelect).toHaveValue('');
    // Recommendations should be hidden
    expect(screen.queryByText('Your Personalized Recommendations')).not.toBeInTheDocument();
    // Get My Recommendations button should be hidden again
    expect(screen.queryByRole('button', { name: 'Get My Recommendations' })).not.toBeInTheDocument();
  });

  it('handles accessibility properly with proper labels and ARIA attributes', () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    // Check modal has proper ARIA attributes
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-labelledby', 'recommender-title');
    expect(modal).toHaveAttribute('aria-describedby', 'recommender-description');
    
    // Check form fields have proper labels
    expect(screen.getByLabelText(/What's your role or grade level/)).toBeInTheDocument();
    expect(screen.getByLabelText(/What's your main goal/)).toBeInTheDocument();
    
    // Check fieldsets have legends
    expect(screen.getByText(/How familiar are you with AI in education/)).toBeInTheDocument();
    expect(screen.getByText(/Any specific topics of interest/)).toBeInTheDocument();
  });

  it('handles empty resources array gracefully', async () => {
    render(<ResourceRecommender resources={[]} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    // Click Get My Recommendations
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get My Recommendations' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get My Recommendations' }));
    
    await waitFor(() => {
      expect(screen.getByText('No resources match your specific criteria.')).toBeInTheDocument();
    });
  });

  it('closes modal and resets recommendations when modal is closed', () => {
    render(<ResourceRecommender resources={mockResources} onApplyFilters={mockOnApplyFilters} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    const gradeSelect = screen.getByLabelText(/What's your role or grade level/);
    fireEvent.change(gradeSelect, { target: { value: 'K-5' } });
    
    // Close modal
    fireEvent.click(screen.getByLabelText('Close recommendations'));
    
    // Reopen modal
    fireEvent.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    
    // Recommendations should not be showing (should be reset)
    expect(screen.queryByText('Your Personalized Recommendations')).not.toBeInTheDocument();
    
    // But form values should still be there
    expect(gradeSelect).toHaveValue('K-5');
  });
}); 