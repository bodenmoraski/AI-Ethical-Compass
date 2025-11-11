// Types for real-time classroom functionality

export interface ActivityFeed {
  id: string;
  type: 'discussion' | 'submission' | 'engagement' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  class_id: number;
  user_id: string;
  created_by: string;
}

export interface LiveStats {
  activeStudents: number;
  newPosts: number;
  newSubmissions: number;
  pendingNotifications: number;
}

export interface StudentEngagement {
  id: string;
  class_id: number;
  student_id: string;
  activity_type: string;
  engagement_score: number;
  last_active: string;
  updated_at: string;
}

export interface RealtimeActivity {
  id: number;
  type: 'discussion' | 'submission' | 'engagement' | 'notification';
  class_id: number;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  data: Record<string, any>;
  timestamp: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityRequest {
  type: 'discussion' | 'submission' | 'engagement' | 'notification';
  class_id: number;
  user_id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
}

export interface UpdateEngagementRequest {
  class_id: number;
  student_id: string;
  activity_type: string;
  engagement_score: number;
  last_active: string;
} 