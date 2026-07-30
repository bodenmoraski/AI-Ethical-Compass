import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authErrorStatus, getServiceClient, requireRole, setCors } from '../lib/api-auth.js';
import { createNotification } from '../lib/notifications.js';

const DECISIONS = ['approve', 'reject'] as const;
type Decision = (typeof DECISIONS)[number];

async function listTeacherRequests(req: VercelRequest, res: VercelResponse) {
  const client = getServiceClient();
  const status = typeof req.query.status === 'string' ? req.query.status : 'pending';

  let query = client
    .from('teacher_access_requests')
    .select(`
      id, user_id, institution_name, institution_type, department,
      request_reason, status, created_at, reviewed_at, reviewed_by, review_notes,
      users(email, first_name, last_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    console.error('Failed to list teacher access requests:', error.message);
    return res.status(200).json({
      success: true,
      requests: [],
      unavailable: true,
      message: 'Teacher access requests are not available on this environment.',
    });
  }

  return res.status(200).json({ success: true, requests: data || [] });
}

async function reviewTeacherRequest(req: VercelRequest, res: VercelResponse, adminId: number) {
  const { requestId, decision, note } = req.body || {};
  const id = Number(requestId);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, error: 'A numeric requestId is required' });
  }
  if (!DECISIONS.includes(decision)) {
    return res.status(400).json({
      success: false,
      error: `decision must be one of: ${DECISIONS.join(', ')}`,
    });
  }

  const client = getServiceClient();

  const { data: request, error: readError } = await client
    .from('teacher_access_requests')
    .select('id, user_id, status, institution_name')
    .eq('id', id)
    .single();

  if (readError || !request) {
    return res.status(404).json({ success: false, error: 'Request not found' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({
      success: false,
      error: `Request has already been ${request.status}`,
    });
  }

  const resolution: Decision = decision;

  const { error: updateError } = await client
    .from('teacher_access_requests')
    .update({
      status: resolution === 'approve' ? 'approved' : 'rejected',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_notes: note ? String(note).slice(0, 500) : null,
    })
    .eq('id', id)
    .eq('status', 'pending');

  if (updateError) {
    console.error('Failed to update teacher access request:', updateError.message);
    return res.status(500).json({ success: false, error: 'Failed to update request' });
  }

  // The role change is the whole point of approval — without it the request is theatre.
  if (resolution === 'approve') {
    const { data: previous } = await client
      .from('users')
      .select('role')
      .eq('id', request.user_id)
      .single();

    const { error: roleError } = await client
      .from('users')
      .update({ role: 'teacher' })
      .eq('id', request.user_id);

    if (roleError) {
      console.error('Failed to grant teacher role:', roleError.message);
      return res.status(500).json({ success: false, error: 'Failed to grant teacher role' });
    }

    const { error: auditError } = await client.from('role_change_log').insert({
      user_id: request.user_id,
      previous_role: previous?.role ?? null,
      new_role: 'teacher',
      updated_by: adminId,
      reason: `Approved teacher access request #${id} (${request.institution_name || 'no institution'})`,
    });

    if (auditError) {
      console.error('Failed to write role change audit row:', auditError.message);
    }
  }

  await createNotification({
    recipient_id: request.user_id,
    type: 'teacher_access_reviewed',
    title: resolution === 'approve' ? '🎓 Teacher access approved' : 'Teacher access not approved',
    message:
      resolution === 'approve'
        ? 'Your teacher account is active. Open the teacher dashboard to create your first class.'
        : `Your teacher access request was not approved.${note ? ` Note: ${String(note).slice(0, 200)}` : ''}`,
    data: { event: 'teacher_access_reviewed', request_id: id, decision: resolution },
    priority: 'high',
  });

  return res.status(200).json({ success: true, id, decision: resolution });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const admin = await requireRole(req, ['admin']);
    const action = typeof req.query.action === 'string' ? req.query.action : '';

    if (req.method === 'GET' && action === 'teacher-requests') {
      return await listTeacherRequests(req, res);
    }

    if (req.method === 'POST' && action === 'review-teacher-request') {
      return await reviewTeacherRequest(req, res, admin.id);
    }

    return res.status(400).json({ success: false, error: 'Invalid action or method' });
  } catch (error) {
    const status = authErrorStatus(error);
    if (status === 500) console.error('Admin API error:', error);
    return res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
