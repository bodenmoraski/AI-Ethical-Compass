import { supabase } from '../lib/supabase-client';

if (!supabase) {
  throw new Error('Supabase client not initialized');
}

// Types for real-time events
export interface RealtimeEvent<T = any> {
  type: string;
  data: T;
}

export interface DiscussionUpdate extends RealtimeEvent {
  type: 'NEW_POST' | 'POST_UPDATED' | 'POST_DELETED' | 'MODERATION_UPDATE';
  data: {
    id: number;
    content?: string;
    author_id: number;
    thread_id: number;
    moderation_status?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface SubmissionUpdate extends RealtimeEvent {
  type: 'NEW_SUBMISSION' | 'SUBMISSION_GRADED' | 'SUBMISSION_UPDATED';
  data: {
    id: number;
    assignment_id: number;
    student_id: number;
    submission_data?: any;
    final_score?: number;
    feedback?: string;
    status: string;
    submitted_at?: string;
    graded_at?: string;
    graded_by?: number;
  };
}

export interface EngagementUpdate extends RealtimeEvent {
  type: 'ENGAGEMENT_UPDATE' | 'STUDENT_ACTIVE' | 'STUDENT_INACTIVE';
  data: {
    id: number;
    student_id: number;
    class_id: number;
    scenario_id?: number;
    session_start?: string;
    session_end?: string;
    time_spent_seconds?: number;
    actions_taken?: Array<{ action: string; timestamp: string; data?: any }>;
    engagement_score?: number;
    is_active?: boolean;
  };
}

export interface NotificationUpdate extends RealtimeEvent {
  type: 'NEW_NOTIFICATION' | 'NOTIFICATION_READ' | 'NOTIFICATION_DELETED';
  data: {
    id: number;
    recipient_id: number;
    sender_id?: number;
    type: string;
    title: string;
    message: string;
    data?: any;
    is_read: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

// Active subscriptions tracking
const activeChannels = new Map<string, any>();

/**
 * Subscribe to real-time discussion updates for a class
 */
export function subscribeToDiscussionUpdates(
  classId: number,
  callback: (update: DiscussionUpdate) => void,
  errorHandler?: (error: Error) => void
) {
  const channelName = `class-${classId}-discussions`;
  
  try {
    // Unsubscribe existing channel if present
    if (activeChannels.has(channelName)) {
      activeChannels.get(channelName).unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_posts',
          filter: `thread_id=in.(select id from discussion_threads where class_id=eq.${classId})`,
        },
        (payload) => {
          handleDiscussionChange(payload, callback);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && errorHandler) {
          errorHandler(new Error('Failed to subscribe to discussion updates'));
        }
      });

    activeChannels.set(channelName, channel);

    // Retry mechanism for failed connections
    setTimeout(() => {
      if (channel.state !== 'joined') {
        try {
          channel.subscribe();
        } catch (retryError) {
          if (errorHandler) {
            errorHandler(retryError instanceof Error ? retryError : new Error('Retry failed'));
          }
        }
      }
    }, 1000);

  } catch (error) {
    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error('Subscription failed'));
    }
  }
}

/**
 * Subscribe to real-time assignment submission updates
 */
export function subscribeToAssignmentSubmissions(
  assignmentId: number,
  callback: (update: SubmissionUpdate) => void,
  errorHandler?: (error: Error) => void
) {
  const channelName = `assignment-${assignmentId}-submissions`;
  
  try {
    if (activeChannels.has(channelName)) {
      activeChannels.get(channelName).unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
          filter: `assignment_id=eq.${assignmentId}`,
        },
        (payload) => {
          handleSubmissionChange(payload, callback);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && errorHandler) {
          errorHandler(new Error('Failed to subscribe to submission updates'));
        }
      });

    activeChannels.set(channelName, channel);

  } catch (error) {
    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error('Subscription failed'));
    }
  }
}

/**
 * Subscribe to real-time student engagement updates for a class
 */
export function subscribeToStudentEngagement(
  classId: number,
  callback: (update: EngagementUpdate) => void,
  errorHandler?: (error: Error) => void
) {
  const channelName = `class-${classId}-engagement`;
  
  try {
    if (activeChannels.has(channelName)) {
      activeChannels.get(channelName).unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_engagement',
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          handleEngagementChange(payload, callback);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && errorHandler) {
          errorHandler(new Error('Failed to subscribe to engagement updates'));
        }
      });

    activeChannels.set(channelName, channel);

  } catch (error) {
    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error('Subscription failed'));
    }
  }
}

/**
 * Subscribe to real-time notifications for a user
 */
export function subscribeToNotifications(
  userId: number,
  callback: (update: NotificationUpdate) => void,
  errorHandler?: (error: Error) => void
) {
  const channelName = `user-${userId}-notifications`;
  
  try {
    if (activeChannels.has(channelName)) {
      activeChannels.get(channelName).unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          handleNotificationChange(payload, callback);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && errorHandler) {
          errorHandler(new Error('Failed to subscribe to notifications'));
        }
      });

    activeChannels.set(channelName, channel);

  } catch (error) {
    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error('Subscription failed'));
    }
  }
}

/**
 * Unsubscribe from all active channels
 */
export function unsubscribeFromAll() {
  for (const [channelName, channel] of activeChannels) {
    try {
      channel.unsubscribe();
    } catch (error) {
      console.warn(`Failed to unsubscribe from ${channelName}:`, error);
    }
  }
  activeChannels.clear();
  
  // Also remove all channels from Supabase client
  supabase.removeAllChannels();
}

/**
 * Unsubscribe from a specific channel
 */
export function unsubscribeFromChannel(channelName: string) {
  if (activeChannels.has(channelName)) {
    try {
      activeChannels.get(channelName).unsubscribe();
      activeChannels.delete(channelName);
    } catch (error) {
      console.warn(`Failed to unsubscribe from ${channelName}:`, error);
    }
  }
}

// Event handlers
function handleDiscussionChange(payload: any, callback: (update: DiscussionUpdate) => void) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      callback({
        type: 'NEW_POST',
        data: newRecord,
      });
      break;
      
    case 'UPDATE':
      // Check if moderation status changed
      if (oldRecord?.moderation_status !== newRecord?.moderation_status) {
        callback({
          type: 'MODERATION_UPDATE',
          data: newRecord,
        });
      } else {
        callback({
          type: 'POST_UPDATED',
          data: newRecord,
        });
      }
      break;
      
    case 'DELETE':
      callback({
        type: 'POST_DELETED',
        data: oldRecord,
      });
      break;
  }
}

function handleSubmissionChange(payload: any, callback: (update: SubmissionUpdate) => void) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      callback({
        type: 'NEW_SUBMISSION',
        data: newRecord,
      });
      break;
      
    case 'UPDATE':
      // Check if it's a grading update
      if (oldRecord?.status !== 'graded' && newRecord?.status === 'graded') {
        callback({
          type: 'SUBMISSION_GRADED',
          data: newRecord,
        });
      } else {
        callback({
          type: 'SUBMISSION_UPDATED',
          data: newRecord,
        });
      }
      break;
  }
}

function handleEngagementChange(payload: any, callback: (update: EngagementUpdate) => void) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      callback({
        type: 'STUDENT_ACTIVE',
        data: newRecord,
      });
      break;
      
    case 'UPDATE':
      // Check if session ended
      if (!oldRecord?.session_end && newRecord?.session_end) {
        callback({
          type: 'STUDENT_INACTIVE',
          data: newRecord,
        });
      } else {
        callback({
          type: 'ENGAGEMENT_UPDATE',
          data: newRecord,
        });
      }
      break;
  }
}

function handleNotificationChange(payload: any, callback: (update: NotificationUpdate) => void) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      callback({
        type: 'NEW_NOTIFICATION',
        data: newRecord,
      });
      break;
      
    case 'UPDATE':
      // Check if read status changed
      if (oldRecord?.is_read !== newRecord?.is_read) {
        callback({
          type: 'NOTIFICATION_READ',
          data: newRecord,
        });
      }
      break;
      
    case 'DELETE':
      callback({
        type: 'NOTIFICATION_DELETED',
        data: oldRecord,
      });
      break;
  }
}

// Utility functions for broadcasting events
export async function broadcastClassEvent(classId: number, event: any) {
  const channel = supabase.channel(`class-${classId}-events`);
  return channel.send({
    type: 'broadcast',
    event: 'class_event',
    payload: event,
  });
}

export async function broadcastAssignmentEvent(assignmentId: number, event: any) {
  const channel = supabase.channel(`assignment-${assignmentId}-events`);
  return channel.send({
    type: 'broadcast',
    event: 'assignment_event',
    payload: event,
  });
}

// Connection status monitoring
export function monitorConnectionStatus(callback: (status: string) => void) {
  // Note: Supabase v2+ handles connection status differently
  // This is a simplified implementation - in practice you'd monitor channel states
  let isConnected = true;
  
  // Check connection every 30 seconds
  const connectionCheck = setInterval(() => {
    try {
      // Attempt to create a test channel to verify connection
      const testChannel = supabase.channel('connection-test');
      testChannel.subscribe((status) => {
        const wasConnected = isConnected;
        isConnected = status === 'SUBSCRIBED';
        
        if (!wasConnected && isConnected) {
          callback('connected');
        } else if (wasConnected && !isConnected) {
          callback('disconnected');
        }
        
        testChannel.unsubscribe();
      });
    } catch (error) {
      if (isConnected) {
        isConnected = false;
        callback(`error: ${error instanceof Error ? error.message : 'Connection failed'}`);
      }
    }
  }, 30000);
  
  // Return cleanup function
  return () => clearInterval(connectionCheck);
} 