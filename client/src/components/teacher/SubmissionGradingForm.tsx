import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../../../lib/supabase-client';
import { isRubric, scoreRubric } from '../../../../lib/rubric-scoring';
import type { Rubric } from './RubricEditor';

interface Submission {
  id: number;
  status: string;
  submitted_at: string;
  final_score?: number;
  feedback?: string;
  is_late?: boolean;
  submission_data: any;
  rubric_scores?: Array<{ id: string; awarded: number }> | null;
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
  rubric?: Rubric | null;
  /** Percent of the assignment total deducted per day late, from the assignment. */
  latePenaltyPerDay?: number;
  onGraded: (updated: Submission) => void;
}

export default function SubmissionGradingForm({
  submission,
  pointsPossible,
  rubric,
  latePenaltyPerDay = 0,
  onGraded,
}: SubmissionGradingFormProps) {
  const usingRubric = isRubric(rubric);

  const [score, setScore] = useState<number | string>(submission.final_score ?? '');
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    (submission.rubric_scores || []).forEach((entry) => {
      initial[entry.id] = entry.awarded;
    });
    return initial;
  });
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mirrors the server's calculation so the teacher sees the score they will store.
  const rubricResult = useMemo(() => {
    if (!usingRubric || !rubric) return null;
    return scoreRubric(rubric, criterionScores, pointsPossible);
  }, [usingRubric, rubric, criterionScores, pointsPossible]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const body = usingRubric
        ? { submissionId: submission.id, rubricScores: criterionScores, feedback }
        : { submissionId: submission.id, score: Number(score), feedback };

      const response = await fetch('/api/teacher?action=grade-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to grade submission');
      }
      const data = await response.json();
      setSuccess(true);
      onGraded(data.submission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = usingRubric
    ? true
    : score !== '' && Number(score) >= 0 && Number(score) <= pointsPossible;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Submission</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGrade} className="space-y-4">
          {submission.is_late && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Submitted late.
              {latePenaltyPerDay > 0
                ? ` A ${latePenaltyPerDay}% per-day penalty is applied automatically when you save this grade.`
                : ' No late penalty is configured for this assignment.'}
            </div>
          )}
          {usingRubric && rubric ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Rubric</p>
              {rubric.criteria.map((criterion) => (
                <div key={criterion.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm">{criterion.name || 'Untitled criterion'}</p>
                    {criterion.description && (
                      <p className="text-xs text-muted-foreground">{criterion.description}</p>
                    )}
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={criterion.maxPoints}
                    aria-label={`Points for ${criterion.name || 'criterion'}`}
                    value={criterionScores[criterion.id] ?? ''}
                    onChange={(e) =>
                      setCriterionScores((prev) => ({
                        ...prev,
                        [criterion.id]: Number(e.target.value) || 0,
                      }))
                    }
                    disabled={loading}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground w-16">
                    / {criterion.maxPoints}
                  </span>
                </div>
              ))}
              <div className="text-sm font-medium">
                Total: {rubricResult?.earned ?? 0}/{rubricResult?.possible ?? 0} →{' '}
                {rubricResult?.points ?? 0}/{pointsPossible} points
              </div>
            </div>
          ) : (
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
          )}
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
            <Button type="submit" disabled={loading || !canSubmit}>
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
