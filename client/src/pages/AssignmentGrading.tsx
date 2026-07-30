import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssignmentGradingView from '../components/teacher/AssignmentGradingView';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase-client';

export default function AssignmentGrading() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the proper access token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch(`/api/teacher?action=assignments&assignmentId=${assignmentId}`, {
          headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch assignment');
        const data = await response.json();
        setAssignment(data.assignments?.[0] || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    if (assignmentId) fetchAssignment();
  }, [assignmentId]);

  if (loading) return <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin h-6 w-6" /></div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!assignment) return <div className="text-gray-500">Assignment not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <Card className="mb-6 mt-4">
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">Points Possible: <span className="font-bold">{assignment.points_possible}</span></div>
        </CardContent>
      </Card>
      <AssignmentGradingView
        assignmentId={assignment.id}
        pointsPossible={assignment.points_possible}
        rubric={assignment.rubric ?? null}
        latePenaltyPerDay={assignment.late_penalty_per_day ?? 0}
      />
    </div>
  );
} 