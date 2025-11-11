import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../../../lib/supabase-client';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  BookOpen,
  Target,
  Send,
  Edit,
  Eye,
  Star
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

interface StudentAssignmentViewProps {
  assignment: Assignment;
  onBack: () => void;
  onSubmissionComplete?: () => void;
}

export default function StudentAssignmentView({ 
  assignment, 
  onBack, 
  onSubmissionComplete 
}: StudentAssignmentViewProps) {
  const [submissionData, setSubmissionData] = useState({
    perspectives: [''],
    answers: {},
    timeSpent: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    // Load existing submission if available
    if (assignment.submission?.submission_data) {
      setSubmissionData(assignment.submission.submission_data);
    }
  }, [assignment]);

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      setSubmissionData(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - startTime) / 1000 / 60) // minutes
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  const handleSubmit = async () => {
    if (!submissionData.perspectives[0]?.trim()) {
      toast({
        title: "Submission incomplete",
        description: "Please provide your perspective before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const finalSubmissionData = {
        ...submissionData,
        timeSpent: Math.floor((Date.now() - startTime) / 1000 / 60)
      };

      const response = await fetch('/api/user-dashboard?action=submit-assignment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          submissionData: finalSubmissionData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit assignment');
      }

      toast({
        title: "Assignment submitted successfully!",
        description: "Your work has been submitted and is now being reviewed.",
      });

      onSubmissionComplete?.();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error submitting assignment",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
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

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
  const isSubmitted = assignment.submission?.status === 'submitted' || assignment.submission?.status === 'graded';
  const isGraded = assignment.submission?.status === 'graded';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-600">{assignment.classes.name} • {assignment.classes.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getAssignmentTypeIcon(assignment.assignment_type)}
          <Badge variant="outline">
            {assignment.points_possible} points
          </Badge>
          {isOverdue && !isSubmitted && (
            <Badge variant="destructive">Overdue</Badge>
          )}
          {isSubmitted && (
            <Badge variant={isGraded ? "default" : "secondary"}>
              {isGraded ? 'Graded' : 'Submitted'}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignment.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-gray-700 mt-1">{assignment.description}</p>
                </div>
              )}
              
              {assignment.instructions && (
                <div>
                  <Label className="text-sm font-medium">Instructions</Label>
                  <div className="mt-1 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                {assignment.due_date && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due Date
                    </Label>
                    <p className={`text-sm mt-1 ${
                      isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'
                    }`}>
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                    {!isSubmitted && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeRemaining(assignment.due_date)}
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Assignment Type</Label>
                  <p className="text-sm text-gray-700 mt-1 capitalize">
                    {assignment.assignment_type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          {!isSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Your Response
                </CardTitle>
                <CardDescription>
                  Provide your analysis and perspective for this assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="perspective" className="text-sm font-medium">
                    Your Perspective *
                  </Label>
                  <Textarea
                    id="perspective"
                    placeholder="Share your thoughts, analysis, and ethical reasoning..."
                    value={submissionData.perspectives[0] || ''}
                    onChange={(e) => setSubmissionData(prev => ({
                      ...prev,
                      perspectives: [e.target.value]
                    }))}
                    rows={8}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be thoughtful and thorough in your response. Consider multiple perspectives and ethical implications.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    Time spent: {submissionData.timeSpent} minutes
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitting || !submissionData.perspectives[0]?.trim()}
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submitted Work */}
          {isSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Your Submission
                </CardTitle>
                <CardDescription>
                  Submitted on {new Date(assignment.submission!.submitted_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {assignment.submission!.submission_data.perspectives[0]}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade and Feedback */}
          {isGraded && assignment.submission?.feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Grade & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Score</span>
                  <span className="text-lg font-bold text-green-600">
                    {assignment.submission.final_score}/{assignment.points_possible}
                  </span>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Teacher Feedback</Label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {assignment.submission.feedback}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={
                  isGraded ? "default" : 
                  isSubmitted ? "secondary" : 
                  isOverdue ? "destructive" : "outline"
                }>
                  {isGraded ? 'Graded' : 
                   isSubmitted ? 'Submitted' : 
                   isOverdue ? 'Overdue' : 'Not Started'}
                </Badge>
              </div>
              
              {assignment.due_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Due Date</span>
                  <span className={`text-sm font-medium ${
                    isOverdue ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {assignment.submission && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submitted</span>
                  <span className="text-sm text-gray-900">
                    {new Date(assignment.submission.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {assignment.submission?.submission_data?.timeSpent && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Spent</span>
                  <span className="text-sm text-gray-900">
                    {assignment.submission.submission_data.timeSpent} minutes
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          {!isSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Consider multiple ethical perspectives and stakeholders
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Support your reasoning with specific examples
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Be thorough and thoughtful in your analysis
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Review your work before submitting
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 