import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';

interface AssignmentStats {
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  overdueCount: number;
  averageScore: number;
  completionRate: number;
  averageTimeSpent: number;
  submissionTrend: {
    date: string;
    count: number;
  }[];
}

interface StudentProgress {
  id: string;
  name: string;
  email: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  timeSpent?: number;
  feedback?: string;
}

interface AssignmentAnalyticsProps {
  assignmentId: string;
  className?: string;
}

export const AssignmentAnalytics: React.FC<AssignmentAnalyticsProps> = ({
  assignmentId,
  className = ''
}) => {
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    fetchAnalytics();
  }, [assignmentId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockStats: AssignmentStats = {
        totalStudents: 25,
        submittedCount: 18,
        gradedCount: 15,
        overdueCount: 3,
        averageScore: 82.5,
        completionRate: 72,
        averageTimeSpent: 45,
        submissionTrend: [
          { date: '2024-01-15', count: 5 },
          { date: '2024-01-16', count: 8 },
          { date: '2024-01-17', count: 3 },
          { date: '2024-01-18', count: 2 },
        ]
      };

      const mockProgress: StudentProgress[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          status: 'graded',
          submittedAt: '2024-01-16T10:30:00Z',
          gradedAt: '2024-01-17T14:20:00Z',
          score: 95,
          timeSpent: 60,
          feedback: 'Excellent analysis of ethical implications.'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          status: 'submitted',
          submittedAt: '2024-01-17T16:45:00Z',
          timeSpent: 45
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@example.com',
          status: 'overdue',
          timeSpent: 30
        },
        {
          id: '4',
          name: 'David Wilson',
          email: 'david@example.com',
          status: 'in_progress',
          timeSpent: 20
        },
        {
          id: '5',
          name: 'Eva Brown',
          email: 'eva@example.com',
          status: 'not_started'
        }
      ];

      setStats(mockStats);
      setStudentProgress(mockProgress);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      graded: 'bg-green-100 text-green-800',
      submitted: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      not_started: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      graded: 'Graded',
      submitted: 'Submitted',
      overdue: 'Overdue',
      in_progress: 'In Progress',
      not_started: 'Not Started'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredStudents = studentProgress.filter(student => {
    if (filter === 'all') return true;
    return student.status === filter;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'score':
        return (b.score || 0) - (a.score || 0);
      case 'time':
        return (b.timeSpent || 0) - (a.timeSpent || 0);
      default:
        return 0;
    }
  });

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Score', 'Time Spent (min)', 'Submitted At', 'Graded At'],
      ...sortedStudents.map(student => [
        student.name,
        student.email,
        student.status,
        student.score?.toString() || '',
        student.timeSpent?.toString() || '',
        student.submittedAt || '',
        student.gradedAt || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignment-${assignmentId}-analytics.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No analytics data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">{stats.submittedCount}</p>
                <p className="text-sm text-muted-foreground">
                  {((stats.submittedCount / stats.totalStudents) * 100).toFixed(1)}% completion
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">
                  {stats.gradedCount} graded
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdueCount}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.averageTimeSpent} min avg time
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Submission Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <span className="ml-2 font-medium">{stats.submittedCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Remaining:</span>
                <span className="ml-2 font-medium">{stats.totalStudents - stats.submittedCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Progress Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Progress</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                  <SelectItem value="score">Sort by Score</SelectItem>
                  <SelectItem value="time">Sort by Time</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportData} size="sm" variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(student.status)}
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {student.score !== undefined && (
                    <div className="text-right">
                      <p className="font-medium">{student.score}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  )}
                  
                  {student.timeSpent && (
                    <div className="text-right">
                      <p className="font-medium">{student.timeSpent} min</p>
                      <p className="text-xs text-muted-foreground">Time</p>
                    </div>
                  )}
                  
                  {getStatusBadge(student.status)}
                </div>
              </div>
            ))}
          </div>
          
          {sortedStudents.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No students match the current filter.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentAnalytics; 