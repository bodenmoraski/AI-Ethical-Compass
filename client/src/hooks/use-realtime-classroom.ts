import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface ActivityFeed {
  id: string;
  type: 'discussion' | 'submission' | 'engagement' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface LiveStats {
  activeStudents: number;
  newPosts: number;
  newSubmissions: number;
  pendingNotifications: number;
}

export function useRealtimeClassroom(classId: number) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    activeStudents: 0,
    newPosts: 0,
    newSubmissions: 0,
    pendingNotifications: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/realtime-classroom?action=activities&classId=${classId}`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.activities) {
          const formattedActivities = data.activities.map((activity: any) => ({
            id: activity.id || `${activity.type}-${Date.now()}`,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            timestamp: activity.timestamp,
            priority: activity.priority,
            data: activity.data,
          }));
          setActivityFeed(formattedActivities);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setError('Failed to load activities');
    }
  }, [classId, getAuthHeaders]);

  const fetchLiveStats = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/realtime-classroom?action=stats&classId=${classId}`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setLiveStats(data.stats);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load statistics');
    }
  }, [classId, getAuthHeaders]);

  const createActivity = useCallback(async (activity: Omit<ActivityFeed, 'id' | 'timestamp'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/realtime-classroom?action=activities', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...activity,
          class_id: classId,
          user_id: 'current-user', // This should come from auth context
        }),
      });

      if (response.ok) {
        // Refresh activities after creating one
        await fetchActivities();
        await fetchLiveStats();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to create activity:', error);
      setError('Failed to create activity');
    }
  }, [classId, getAuthHeaders, fetchActivities, fetchLiveStats]);

  const reconnect = useCallback(async () => {
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      await Promise.all([fetchActivities(), fetchLiveStats()]);
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      setError('Failed to reconnect to real-time data');
    }
  }, [fetchActivities, fetchLiveStats]);

  // Initialize connection and set up polling
  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const initializeConnection = async () => {
      if (!mounted) return;
      
      setConnectionStatus('connecting');
      setError(null);

      try {
        await Promise.all([fetchActivities(), fetchLiveStats()]);
        if (mounted) {
          setConnectionStatus('connected');
          
          // Set up polling for real-time updates (every 5 seconds)
          interval = setInterval(() => {
            if (mounted) {
              fetchActivities();
              fetchLiveStats();
            }
          }, 5000);
        }
      } catch (error) {
        if (mounted) {
          setConnectionStatus('error');
          setError('Failed to connect to real-time data');
        }
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchActivities, fetchLiveStats]);

  return {
    connectionStatus,
    activityFeed,
    liveStats,
    error,
    createActivity,
    reconnect,
    refreshData: useCallback(() => {
      fetchActivities();
      fetchLiveStats();
    }, [fetchActivities, fetchLiveStats]),
  };
} 