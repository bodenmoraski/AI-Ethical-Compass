import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../../../lib/supabase-client';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  Target
} from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description?: string;
  instructions?: string;
  assignment_type: 'scenario' | 'custom' | 'discussion';
  due_date?: string;
  points_possible: number;
  is_published: boolean;
  class_id: number;
  created_at: string;
  classes: {
    name: string;
    subject: string;
  };
  submission?: {
    id: number;
    status: string;
    submitted_at: string;
    final_score?: number;
    feedback?: string;
    submission_data: any;
  };
}

interface StudentAssignmentListProps {
  onAssignmentSelect?: (assignment: Assignment) => void;
}

export default function StudentAssignmentList({ onAssignmentSelect }: StudentAssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/user-dashboard?action=assignments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Error loading assignments",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getAssignmentStatus = (assignment: Assignment) => {
    if (!assignment.submission) {
      if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
        return { status: 'overdue', label: 'Overdue', color: 'destructive' as const };
      }
      return { status: 'not_started', label: 'Not Started', color: 'secondary' as const };
    }

    if (assignment.submission.status === 'submitted') {
      return { status: 'submitted', label: 'Submitted', color: 'default' as const };
    }

    if (assignment.submission.status === 'graded') {
      return { status: 'graded', label: 'Graded', color: 'default' as const };
    }

    return { status: 'in_progress', label: 'In Progress', color: 'secondary' as const };
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) {
      return 'Overdue';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
    return 'Due soon';
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'scenario':
        return <BookOpen className="h-4 w-4" />;
      case 'discussion':
        return <FileText className="h-4 w-4" />;
      case 'custom':
        return <Target className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading assignments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading assignments</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchAssignments} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
            <p className="text-gray-600 mb-6">
              You don't have any assignments yet. Check back later or contact your teacher.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort assignments by due date (closest first) and status
  const sortedAssignments = [...assignments].sort((a, b) => {
    // Overdue assignments first
    const aOverdue = a.due_date && new Date(a.due_date) < new Date() && !a.submission;
    const bOverdue = b.due_date && new Date(b.due_date) < new Date() && !b.submission;
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Then by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    
    // Then by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">My Assignments</h3>
          <p className="text-gray-600">Complete your assigned work and track your progress</p>
        </div>
        <Button variant="outline" onClick={fetchAssignments}>
          <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : 'hidden'}`} />
          Refresh
        </Button>
      </div>

      {/* Assignments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedAssignments.map((assignment) => {
          const status = getAssignmentStatus(assignment);
          const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date() && !assignment.submission;
          
          return (
            <Card 
              key={assignment.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                isOverdue ? 'border-red-200 bg-red-50' : ''
              }`}
              onClick={() => onAssignmentSelect?.(assignment)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{assignment.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      {getAssignmentTypeIcon(assignment.assignment_type)}
                      {assignment.classes.name} • {assignment.points_possible} points
                    </CardDescription>
                  </div>
                  <Badge variant={status.color}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {assignment.description || "No description provided"}
                  </p>
                  
                  <div className="space-y-2">
                    {assignment.due_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due Date
                        </span>
                        <span className={`font-medium ${
                          isOverdue ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {assignment.due_date && !assignment.submission && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Time Left
                        </span>
                        <span className={`font-medium ${
                          isOverdue ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {getTimeRemaining(assignment.due_date)}
                        </span>
                      </div>
                    )}
                    
                    {assignment.submission && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Submitted</span>
                        <span className="text-gray-900">
                          {new Date(assignment.submission.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {assignment.submission?.final_score !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Score</span>
                        <span className="font-medium text-green-600">
                          {assignment.submission.final_score}/{assignment.points_possible}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex-1">
                      <Progress 
                        value={
                          assignment.submission 
                            ? assignment.submission.status === 'graded' ? 100 : 75
                            : 0
                        } 
                        className="h-2"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignmentSelect?.(assignment);
                      }}
                    >
                      {assignment.submission ? 'View' : 'Start'}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {assignments.length}
              </div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.submission?.status === 'graded').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {assignments.filter(a => a.submission?.status === 'submitted').length}
              </div>
              <div className="text-sm text-gray-600">Submitted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {assignments.filter(a => 
                  a.due_date && new Date(a.due_date) < new Date() && !a.submission
                ).length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 