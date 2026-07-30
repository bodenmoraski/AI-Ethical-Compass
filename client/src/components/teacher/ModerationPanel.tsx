import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../../../lib/supabase-client';
import { MessageSquare, Loader2, ShieldCheck, ShieldX, EyeOff } from 'lucide-react';

interface QueueItem {
  id: number;
  content_type: string;
  content_id: number;
  class_id: number | null;
  flagged_reason: string | null;
  content_text: string | null;
  status: string;
  created_at: string;
}

type Resolution = 'approve' | 'reject' | 'dismiss';

export default function ModerationPanel() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<string>('teacher');
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const { toast } = useToast();

  const authHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/moderation?status=pending', {
        headers: await authHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to load moderation queue');
      }

      const data = await response.json();
      setItems(data.items || []);
      setScope(data.scope || 'teacher');
      setUnavailable(Boolean(data.unavailable));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const resolve = async (id: number, resolution: Resolution) => {
    try {
      setResolvingId(id);
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ id, resolution }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update item');
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Moderation updated', description: `Item ${id} marked as ${resolution}.` });
    } catch (err) {
      toast({
        title: 'Could not update item',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading moderation queue…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Moderation</h3>
          <p className="text-sm text-gray-600">
            {scope === 'admin'
              ? 'All content flagged by automated moderation, awaiting review.'
              : 'Content flagged by automated moderation in your classes, awaiting review.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQueue}>
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-800">{error}</CardContent>
        </Card>
      )}

      {unavailable && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            The moderation queue table is not set up on this environment yet, so nothing can be
            reviewed here.
          </CardContent>
        </Card>
      )}

      {!error && !unavailable && items.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">Nothing to review</h4>
            <p className="text-gray-600">
              {scope === 'admin'
                ? 'Flagged perspectives and discussions across the platform will appear here.'
                : 'Flagged content from your classes appears here. Perspectives on the public scenario library are reviewed by platform administrators.'}
            </p>
          </CardContent>
        </Card>
      )}

      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base capitalize">
                  {item.content_type.replace(/_/g, ' ')} #{item.content_id}
                </CardTitle>
                <CardDescription>
                  Flagged {new Date(item.created_at).toLocaleString()}
                  {item.flagged_reason ? ` — ${item.flagged_reason}` : ''}
                </CardDescription>
              </div>
              <Badge variant="destructive">{item.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
              {item.content_text || <span className="italic text-gray-400">No content stored</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={resolvingId === item.id}
                onClick={() => resolve(item.id, 'approve')}
              >
                <ShieldCheck className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={resolvingId === item.id}
                onClick={() => resolve(item.id, 'reject')}
              >
                <ShieldX className="h-4 w-4 mr-2" /> Remove
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={resolvingId === item.id}
                onClick={() => resolve(item.id, 'dismiss')}
              >
                <EyeOff className="h-4 w-4 mr-2" /> Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
