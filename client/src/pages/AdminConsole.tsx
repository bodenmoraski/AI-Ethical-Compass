import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../../../lib/supabase-client';
import { Loader2, ShieldCheck, ShieldX, Inbox } from 'lucide-react';

interface TeacherRequest {
  id: number;
  user_id: number;
  institution_name: string | null;
  institution_type: string | null;
  department: string | null;
  request_reason: string | null;
  status: string;
  created_at: string;
  users?: { email?: string; first_name?: string; last_name?: string; role?: string } | null;
}

export default function AdminConsole() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const { toast } = useToast();

  const isAdmin = userProfile?.role === 'admin';

  const authHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin?action=teacher-requests&status=pending', {
        headers: await authHeaders(),
      });
      if (!response.ok) throw new Error('Failed to load requests');
      const data = await response.json();
      setRequests(data.requests || []);
      setUnavailable(Boolean(data.unavailable));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (isAdmin) fetchRequests();
    else setLoading(false);
  }, [isAdmin, fetchRequests]);

  const review = async (id: number, decision: 'approve' | 'reject') => {
    try {
      setBusyId(id);
      const response = await fetch('/api/admin?action=review-teacher-request', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ requestId: id, decision, note: notes[id] || undefined }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || 'Failed to update request');
      }

      setRequests((prev) => prev.filter((request) => request.id !== id));
      toast({
        title: decision === 'approve' ? 'Teacher access granted' : 'Request rejected',
        description:
          decision === 'approve'
            ? 'The account now has the teacher role and was notified in the app.'
            : 'The requester was notified in the app.',
      });
    } catch (error) {
      toast({
        title: 'Could not update request',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Admin access required</CardTitle>
            <CardDescription>
              This console is limited to platform administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Console</h1>
          <p className="text-gray-600">Review pending teacher access requests.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests}>
          Refresh
        </Button>
      </div>

      {unavailable && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            Teacher access requests are not available on this environment.
          </CardContent>
        </Card>
      )}

      {!unavailable && requests.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Inbox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No pending requests</h3>
            <p className="text-gray-600">New teacher access requests will appear here.</p>
          </CardContent>
        </Card>
      )}

      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">
                  {[request.users?.first_name, request.users?.last_name].filter(Boolean).join(' ') ||
                    request.users?.email ||
                    `User #${request.user_id}`}
                </CardTitle>
                <CardDescription>
                  {request.users?.email} · Requested{' '}
                  {new Date(request.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary">{request.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Institution</dt>
                <dd>{request.institution_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Department</dt>
                <dd>{request.department || '—'}</dd>
              </div>
            </dl>

            {request.request_reason && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm whitespace-pre-wrap">
                {request.request_reason}
              </div>
            )}

            <Textarea
              rows={2}
              placeholder="Optional note sent to the requester"
              value={notes[request.id] || ''}
              onChange={(e) => setNotes((prev) => ({ ...prev, [request.id]: e.target.value }))}
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={busyId === request.id}
                onClick={() => review(request.id, 'approve')}
              >
                <ShieldCheck className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={busyId === request.id}
                onClick={() => review(request.id, 'reject')}
              >
                <ShieldX className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
