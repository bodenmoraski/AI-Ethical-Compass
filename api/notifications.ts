import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authErrorStatus, getServiceClient, requireAppUser, setCors } from '../lib/api-auth.js';

const MAX_LIMIT = 50;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Identity always comes from the token; a notification list is never addressable
    // by a caller-supplied user id.
    const user = await requireAppUser(req);
    const client = getServiceClient();

    if (req.method === 'GET') {
      const limit = Math.min(Number(req.query.limit) || 20, MAX_LIMIT);
      const unreadOnly = req.query.unread === 'true';

      let query = client
        .from('notifications')
        .select('id, type, title, message, data, priority, is_read, created_at')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) query = query.eq('is_read', false);

      const { data, error } = await query;

      if (error) {
        console.error('Failed to read notifications:', error.message);
        return res.status(200).json({
          success: true,
          notifications: [],
          unreadCount: 0,
          unavailable: true,
        });
      }

      const { count } = await client
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      return res.status(200).json({
        success: true,
        notifications: data || [],
        unreadCount: count || 0,
      });
    }

    if (req.method === 'PATCH') {
      const { id, all } = req.body || {};

      if (all === true) {
        const { error } = await client
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('recipient_id', user.id)
          .eq('is_read', false);

        if (error) {
          return res.status(500).json({ success: false, error: 'Failed to mark notifications read' });
        }
        return res.status(200).json({ success: true, markedAll: true });
      }

      const notificationId = Number(id);
      if (!Number.isInteger(notificationId) || notificationId <= 0) {
        return res.status(400).json({ success: false, error: 'A numeric notification id is required' });
      }

      // Scoping the update by recipient makes another user's id a no-op rather than a leak.
      const { data, error } = await client
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('recipient_id', user.id)
        .select('id');

      if (error) {
        return res.status(500).json({ success: false, error: 'Failed to mark notification read' });
      }
      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      return res.status(200).json({ success: true, id: notificationId });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    const status = authErrorStatus(error);
    if (status === 500) console.error('Notifications API error:', error);
    return res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
