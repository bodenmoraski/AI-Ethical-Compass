import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Users,
  MessageCircle,
  FileText,
  TrendingUp,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

// Import our real-time functions (commented out for now - using mock data)
// import {
//   subscribeToDiscussionUpdates,
//   subscribeToAssignmentSubmissions,
//   subscribeToStudentEngagement,
//   subscribeToNotifications,
//   unsubscribeFromAll,
//   monitorConnectionStatus,
//   type DiscussionUpdate,
//   type SubmissionUpdate,
//   type EngagementUpdate,
//   type NotificationUpdate,
// } from '../../../../api/realtime-classroom';

interface LiveClassroomMonitorProps {
  classId: number;
  userId: number;
  assignmentIds?: number[];
}

interface ActivityFeed {
  id: string;
  type: 'discussion' | 'submission' | 'engagement' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

const LiveClassroomMonitor: React.FC<LiveClassroomMonitorProps> = ({
  classId,
  userId,
  assignmentIds = [],
}) => {
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([]);
  const [liveStats, setLiveStats] = useState({
    activeStudents: 0,
    newPosts: 0,
    newSubmissions: 0,
    pendingNotifications: 0,
  });

  // Add activity to feed
  const addActivity = useCallback((activity: Omit<ActivityFeed, 'id'>) => {
    const newActivity: ActivityFeed = {
      ...activity,
      id: `${activity.type}-${Date.now()}-${Math.random()}`,
    };

    setActivityFeed(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
  }, []);

  // Real-time event handlers would go here when API is connected
  // const handleDiscussionUpdate = useCallback((update: DiscussionUpdate) => { ... }, [addActivity]);
  // const handleSubmissionUpdate = useCallback((update: SubmissionUpdate) => { ... }, [addActivity]);
  // const handleEngagementUpdate = useCallback((update: EngagementUpdate) => { ... }, [addActivity]);
  // const handleNotificationUpdate = useCallback((update: NotificationUpdate) => { ... }, [addActivity]);

  // Real-time subscriptions would go here when API is connected
  // useEffect(() => {
  //   const errorHandler = (error: Error) => {
  //     console.error('Real-time subscription error:', error);
  //     setConnectionStatus('error');
  //   };
  //   // Real-time setup code...
  // }, [classId, userId, assignmentIds]);

  // Simulate real-time updates (replace with actual real-time API calls)
  useEffect(() => {
    setConnectionStatus('connected');
    
    // Simulate periodic activity
    const interval = setInterval(() => {
      const activities = [
        {
          type: 'discussion' as const,
          title: 'New Discussion Post',
          description: 'Student posted in Ethics Discussion thread',
          priority: 'medium' as const,
        },
        {
          type: 'submission' as const,
          title: 'Assignment Submitted',
          description: 'Student completed Bias Detection Exercise',
          priority: 'medium' as const,
        },
        {
          type: 'engagement' as const,
          title: 'Low Engagement Alert',
          description: 'Student showing decreased activity',
          priority: 'high' as const,
        },
      ];

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      addActivity({
        ...randomActivity,
        timestamp: new Date().toISOString(),
      });

      // Update stats
      setLiveStats(prev => ({
        ...prev,
        activeStudents: Math.max(1, prev.activeStudents + (Math.random() > 0.5 ? 1 : -1)),
        newPosts: prev.newPosts + (randomActivity.type === 'discussion' ? 1 : 0),
        newSubmissions: prev.newSubmissions + (randomActivity.type === 'submission' ? 1 : 0),
      }));
    }, 10000); // Add activity every 10 seconds for demo

    return () => clearInterval(interval);
  }, [addActivity]);

  // Reset stats
  const resetStats = () => {
    setLiveStats({
      activeStudents: 0,
      newPosts: 0,
      newSubmissions: 0,
      pendingNotifications: 0,
    });
  };

  // Clear activity feed
  const clearFeed = () => {
    setActivityFeed([]);
  };

  // Get priority icon
  const getPriorityIcon = (priority: string, type: string) => {
    if (priority === 'high') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (type) {
      case 'discussion': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'submission': return <FileText className="h-4 w-4 text-green-500" />;
      case 'engagement': return <Users className="h-4 w-4 text-purple-500" />;
      case 'notification': return <Bell className="h-4 w-4 text-orange-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
        {connectionStatus === 'connected' ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          Real-time connection: {connectionStatus}
          {connectionStatus === 'connected' && ' - Monitoring live classroom activity'}
        </AlertDescription>
      </Alert>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Posts</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.newPosts}</div>
            <p className="text-xs text-muted-foreground">Discussion activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.newSubmissions}</div>
            <p className="text-xs text-muted-foreground">Assignment submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.pendingNotifications}</div>
            <p className="text-xs text-muted-foreground">Pending alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Activity Feed</CardTitle>
              <CardDescription>Real-time classroom events</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={resetStats}>
                Reset Stats
              </Button>
              <Button variant="outline" size="sm" onClick={clearFeed}>
                Clear Feed
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {activityFeed.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>Waiting for classroom activity...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3">
                      {getPriorityIcon(activity.priority, activity.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={activity.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    {index < activityFeed.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveClassroomMonitor; 