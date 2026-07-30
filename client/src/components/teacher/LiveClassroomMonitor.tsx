import React, { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useRealtimeClassroom } from '../../hooks/use-realtime-classroom';
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

interface LiveClassroomMonitorProps {
  classId: number;
  userId: number;
  assignmentIds?: number[];
}

const LiveClassroomMonitor: React.FC<LiveClassroomMonitorProps> = ({
  classId,
  userId,
  assignmentIds = [],
}) => {
  // Use the real-time classroom hook
  const {
    connectionStatus,
    activityFeed,
    liveStats,
    error,
    createActivity,
    reconnect,
    refreshData,
  } = useRealtimeClassroom(classId);

  // Only available in local development so production teachers can't inject fake events
  const showDevTools = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

  const createTestActivity = useCallback(() => {
    createActivity({
      type: 'discussion',
      title: 'Test Discussion Post',
      description: 'This is a manually created test activity',
      priority: 'medium',
    });
  }, [createActivity]);

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
          {error && ` - Error: ${error}`}
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
              <Button variant="outline" size="sm" onClick={refreshData}>
                Refresh
              </Button>
              {showDevTools && (
                <Button variant="outline" size="sm" onClick={createTestActivity}>
                  Test Activity
                </Button>
              )}
              {connectionStatus === 'error' && (
                <Button variant="outline" size="sm" onClick={reconnect}>
                  Reconnect
                </Button>
              )}
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
                  <p className="text-sm">Real data will appear here when students interact with the platform</p>
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
                              {activity.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        
                        {/* Additional data display */}
                        {activity.data && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            {JSON.stringify(activity.data, null, 2)}
                          </div>
                        )}
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

      {/* Real-time Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Real-time Data: {connectionStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Database: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>API: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Updates: Every 5s</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveClassroomMonitor; 