import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, CheckCircle, Clock, User, Eye } from 'lucide-react';
import { supabase } from '../../../../lib/supabase-client';

interface Submission {
  id: number;
  status: string;
  submitted_at: string;
  final_score?: number;
  feedback?: string;
  users: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

interface SubmissionListProps {
  assignmentId: number;
  onSelectSubmission: (submission: Submission) => void;
}

export default function SubmissionList({ assignmentId, onSelectSubmission }: SubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the proper access token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch(`/api/teacher?action=assignment-submissions&assignmentId=${assignmentId}`, {
          headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch submissions');
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [assignmentId]);

  if (loading) return <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin h-6 w-6" /></div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-gray-500">No submissions yet.</div>
        ) : (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">
                    {sub.users.first_name || ''} {sub.users.last_name || ''} ({sub.users.email})
                  </span>
                  <Badge variant={sub.status === 'graded' ? 'default' : sub.status === 'submitted' ? 'secondary' : 'outline'}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </Badge>
                  {sub.final_score !== undefined && (
                    <span className="text-green-600 font-bold ml-2">{sub.final_score} pts</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                  <Button size="sm" variant="outline" onClick={() => onSelectSubmission(sub)}>
                    <Eye className="h-4 w-4 mr-1" /> Grade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 