import { getServiceClient } from './api-auth.js';

export type ActivityType = 'discussion' | 'submission' | 'engagement' | 'notification';

export interface ActivityInput {
  type: ActivityType;
  classId: number;
  /** `realtime_activities.user_id` is TEXT; we store the app user id or email. */
  userId: string | number;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  data?: Record<string, unknown>;
}

/**
 * Writes one classroom event to the live activity feed.
 *
 * Best-effort by design: the feed is observability, so a failure here must never
 * break the enrollment, submission, or grading action that produced it.
 */
export async function recordActivity(activity: ActivityInput): Promise<boolean> {
  try {
    if (!Number.isInteger(activity.classId) || activity.classId <= 0) {
      return false;
    }

    const client = getServiceClient();
    const { error } = await client.from('realtime_activities').insert({
      type: activity.type,
      class_id: activity.classId,
      user_id: String(activity.userId),
      title: activity.title,
      description: activity.description,
      priority: activity.priority || 'medium',
      data: activity.data || {},
      timestamp: new Date().toISOString(),
      created_by: String(activity.userId),
    });

    if (error) {
      console.error('Failed to record classroom activity:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Activity feed unavailable:', error);
    return false;
  }
}
