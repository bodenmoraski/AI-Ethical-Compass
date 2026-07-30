import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AuthError,
  authErrorStatus,
  getServiceClient,
  requireAppUser,
  setCors,
} from '../lib/api-auth.js';

const RESOLUTIONS = ['approve', 'reject', 'dismiss'] as const;
type Resolution = (typeof RESOLUTIONS)[number];

async function teacherClassIds(userId: number): Promise<number[]> {
  const client = getServiceClient();
  const { data } = await client.from('classes').select('id').eq('teacher_id', userId);
  return (data || []).map((row: { id: number }) => row.id);
}

/** Applies the reviewer's decision to the underlying content row. */
async function applyResolution(
  contentType: string,
  contentId: number,
  resolution: Resolution
): Promise<void> {
  if (contentType !== 'perspective') return;
  if (resolution === 'dismiss') return;

  const client = getServiceClient();
  await client
    .from('perspectives')
    .update({ moderation_status: resolution === 'approve' ? 'approved' : 'rejected' })
    .eq('id', contentId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const user = await requireAppUser(req);
    if (user.role !== 'teacher' && user.role !== 'admin') {
      throw new AuthError('Teacher or admin access required', 403);
    }

    const client = getServiceClient();

    if (req.method === 'GET') {
      const status = typeof req.query.status === 'string' ? req.query.status : 'pending';

      let query = client
        .from('moderation_queue')
        .select('id, content_type, content_id, class_id, flagged_reason, content_text, ai_analysis, status, created_at, reviewed_at, action_taken')
        .order('created_at', { ascending: false })
        .limit(100);

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Teachers only review content from their own classes; platform-wide
      // (class-less) flags are handled by admins.
      if (user.role !== 'admin') {
        const classIds = await teacherClassIds(user.id);
        if (classIds.length === 0) {
          return res.status(200).json({ success: true, items: [], scope: 'teacher' });
        }
        query = query.in('class_id', classIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Moderation queue read failed:', error.message);
        return res.status(200).json({
          success: true,
          items: [],
          scope: user.role,
          unavailable: true,
          message: 'Moderation queue is not available yet.',
        });
      }

      return res.status(200).json({ success: true, items: data || [], scope: user.role });
    }

    if (req.method === 'POST') {
      const { id, resolution, note } = req.body || {};
      const itemId = Number(id);

      if (!Number.isInteger(itemId) || itemId <= 0) {
        return res.status(400).json({ success: false, error: 'A numeric queue item id is required' });
      }
      if (!RESOLUTIONS.includes(resolution)) {
        return res.status(400).json({
          success: false,
          error: `resolution must be one of: ${RESOLUTIONS.join(', ')}`,
        });
      }

      const { data: item, error: itemError } = await client
        .from('moderation_queue')
        .select('id, content_type, content_id, class_id')
        .eq('id', itemId)
        .single();

      if (itemError || !item) {
        return res.status(404).json({ success: false, error: 'Queue item not found' });
      }

      if (user.role !== 'admin') {
        const classIds = await teacherClassIds(user.id);
        if (!item.class_id || !classIds.includes(item.class_id)) {
          throw new AuthError('Not authorized to moderate this content', 403);
        }
      }

      const { error: updateError } = await client
        .from('moderation_queue')
        .update({
          status: resolution === 'dismiss' ? 'reviewed' : resolution === 'approve' ? 'approved' : 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          action_taken: note ? `${resolution}: ${String(note).slice(0, 500)}` : resolution,
        })
        .eq('id', itemId);

      if (updateError) {
        return res.status(500).json({ success: false, error: 'Failed to update queue item' });
      }

      await applyResolution(item.content_type, item.content_id, resolution as Resolution);

      return res.status(200).json({ success: true, id: itemId, resolution });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    const status = authErrorStatus(error);
    if (status === 500) console.error('Moderation API error:', error);
    return res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
