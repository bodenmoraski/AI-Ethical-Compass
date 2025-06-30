import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../../../lib/supabase-client';

interface Submission {
  id: number;
  status: string;
  submitted_at: string;
  final_score?: number;
  feedback?: string;
  submission_data: any;
  users: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

interface SubmissionGradingFormProps {
  submission: Submission;
  pointsPossible: number;
  onGraded: (updated: Submission) => void;
}

export default function SubmissionGradingForm({ submission, pointsPossible, onGraded }: SubmissionGradingFormProps) {
  const [score, setScore] = useState(submission.final_score ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Get the proper access token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/teacher?action=grade-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          submissionId: submission.id,
          score: Number(score),
          feedback
        })
      });
      if (!response.ok) throw new Error('Failed to grade submission');
      const data = await response.json();
      setSuccess(true);
      onGraded(data.submission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Submission</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGrade} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Score (out of {pointsPossible})</label>
            <Input
              type="number"
              min={0}
              max={pointsPossible}
              value={score}
              onChange={e => setScore(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Feedback</label>
            <Textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={4}
              placeholder="Provide constructive feedback..."
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading || score === '' || Number(score) < 0 || Number(score) > pointsPossible}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Grade
            </Button>
            {success && <span className="text-green-600 font-medium">Graded!</span>}
            {error && <span className="text-red-600">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 