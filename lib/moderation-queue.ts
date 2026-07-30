import { getServiceClient } from './api-auth.js';

export interface QueueItemInput {
  contentType: 'perspective' | 'discussion_post' | 'assignment_submission' | 'user_scenario';
  contentId: number;
  classId?: number | null;
  flaggedBy?: number | null;
  flaggedReason: string;
  contentText: string;
  aiAnalysis?: unknown;
}

/**
 * Records flagged content for human review. Best-effort: moderation bookkeeping must
 * never fail the user action that triggered it.
 */
export async function enqueueForModeration(item: QueueItemInput): Promise<boolean> {
  try {
    const client = getServiceClient();
    const { error } = await client.from('moderation_queue').insert({
      content_type: item.contentType,
      content_id: item.contentId,
      class_id: item.classId ?? null,
      flagged_by: item.flaggedBy ?? null,
      flagged_reason: item.flaggedReason,
      content_text: item.contentText?.slice(0, 5000) ?? '',
      ai_analysis: item.aiAnalysis ?? null,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to enqueue moderation item:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Moderation queue unavailable:', error);
    return false;
  }
}
