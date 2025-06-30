import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import AssignmentManager from './AssignmentManager';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Search,
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../../../lib/supabase-client';

interface ClassDetailViewProps {
  classId: string;
}

interface ClassData {
  id: number;
  name: string;
  description: string;
  teacher_id: number;
  school_year: string;
  semester: string;
  subject: string;
  grade_level: string;
  class_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  student_count: number;
  assignment_count: number;
  completion_rate: number;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_date: string;
  status: string;
  completion_rate: number;
  last_activity: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  points_possible: number;
  is_published: boolean;
  submission_count: number;
  graded_count: number;
}

interface AnalyticsData {
  engagement_trends: Array<{
    date: string;
    engagement_score: number;
  }>;
  completion_rates: {
    total: number;
    by_assignment: Array<{
      assignment_id: number;
      completion_rate: number;
    }>;
  };
}

const ClassDetailView: React.FC<ClassDetailViewProps> = ({ classId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);

  useEffect(() => {
    async function getToken() {
      const { data: { session } } = await supabase.auth.getSession();
      setAccessToken(session?.access_token || null);
    }
    getToken();
  }, []);

  // Fetch class data
  const {
    data: classData,
    isLoading: classLoading,
    error: classError,
  } = useQuery<ClassData>({
    queryKey: ['class', classId, accessToken],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No authentication token available');
      }
      
      try {
        const response = await fetch(`/api/teacher?action=classes&classId=${classId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Class not found');
          }
          if (response.status === 403) {
            throw new Error('Access denied - teacher role required');
          }
          if (response.status === 500) {
            const errorData = await response.text();
            console.error('Server error:', errorData);
            throw new Error('Server error - please check your teacher access');
          }
          throw new Error(`HTTP ${response.status}: Failed to fetch class`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Invalid response format');
        }
        
        return result.data;
      } catch (error) {
        console.error('Error fetching class:', error);
        throw error;
      }
    },
    enabled: !!accessToken,
    retry: (failureCount, error) => {
      // Don't retry on authentication or permission errors
      if (error.message.includes('Access denied') || 
          error.message.includes('teacher role required') ||
          error.message.includes('Class not found')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Fetch students
  const {
    data: studentsData,
    isLoading: studentsLoading,
  } = useQuery<{ data: Student[]; total: number }>({
    queryKey: ['class-students', classId, accessToken],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No authentication token available');
      }
      
      try {
        const response = await fetch(`/api/teacher?action=students&classId=${classId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch students: ${response.status}`);
        }
        
        const result = await response.json();
        return result.success ? result : { data: [], total: 0 };
      } catch (error) {
        console.error('Error fetching students:', error);
        return { data: [], total: 0 }; // Return empty data instead of throwing
      }
    },
    enabled: !!classData && !!accessToken,
  });

  // Fetch assignments
  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
  } = useQuery<{ data: Assignment[]; total: number }>({
    queryKey: ['class-assignments', classId, accessToken],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No authentication token available');
      }
      
      try {
        const response = await fetch(`/api/teacher?action=assignments&classId=${classId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assignments: ${response.status}`);
        }
        
        const result = await response.json();
        return result.success ? result : { data: [], total: 0 };
      } catch (error) {
        console.error('Error fetching assignments:', error);
        return { data: [], total: 0 }; // Return empty data instead of throwing
      }
    },
    enabled: !!classData && !!accessToken,
  });

  // Fetch analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useQuery<{ data: AnalyticsData }>({
    queryKey: ['class-analytics', classId, accessToken],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No authentication token available');
      }
      
      try {
        const response = await fetch(`/api/teacher-analytics?endpoint=analytics&classId=${classId}&type=summary`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.status}`);
        }
        
        const result = await response.json();
        return result.success ? result : { 
          data: { 
            engagement_trends: [], 
            completion_rates: { total: 0, by_assignment: [] } 
          } 
        };
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return { 
          data: { 
            engagement_trends: [], 
            completion_rates: { total: 0, by_assignment: [] } 
          } 
        }; // Return empty data instead of throwing
      }
    },
    enabled: !!classData && activeTab === 'analytics' && !!accessToken,
  });

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!studentsData?.data || !Array.isArray(studentsData.data)) return [];
    if (!studentSearchQuery) return studentsData.data;
    
    return studentsData.data.filter(student =>
      student.first_name && student.last_name && (
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
      )
    );
  }, [studentsData?.data, studentSearchQuery]);

  // Handle assignment refresh
  const handleAssignmentRefresh = () => {
    // This will be called when assignments are created/updated/deleted
    // The queries will automatically refetch due to their keys
  };

  if (classLoading) {
    return (
      <div className="space-y-6" data-testid="class-detail-loading">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (classError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {classError.message.toLowerCase().includes('not found') 
            ? 'Class not found'
            : 'Error loading class details'
          }
        </AlertDescription>
      </Alert>
    );
  }

  if (!classData) return null;

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <p className="text-muted-foreground">{classData.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Code: <code className="bg-muted px-1 rounded">{classData.class_code}</code></span>
            <span>{classData.school_year} {classData.semester}</span>
            <span>{classData.subject} • Grade {classData.grade_level}</span>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Class
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.student_count} Students</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.assignment_count} Assignments</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.completion_rate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <Badge variant={classData.is_active ? 'default' : 'secondary'}>
              {classData.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">5 new submissions today</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">3 students joined this week</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">2 assignments due this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start"
                  onClick={() => setAssignmentModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Add Students
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Full Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Students ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {student.first_name?.[0] || ''}{student.last_name?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{student.completion_rate}%</p>
                        <p className="text-xs text-muted-foreground">completion</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <AssignmentManager 
            classId={parseInt(classId)} 
            onRefresh={handleAssignmentRefresh}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Student engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Showing engagement data for the past 30 days
                    </p>
                    {/* Chart would go here - using placeholder for now */}
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Engagement Chart Placeholder</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Rates</CardTitle>
                <CardDescription>Assignment completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="space-y-4">
                    <div className="text-2xl font-bold">
                      {analyticsData?.data.completion_rates.total}%
                    </div>
                    <p className="text-sm text-muted-foreground">Overall completion rate</p>
                    <div className="space-y-2">
                      {(analyticsData?.data?.completion_rates?.by_assignment || []).map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm">Assignment {item.assignment_id}</span>
                          <span className="text-sm font-medium">{item.completion_rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assignment Manager Modal */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assignment Manager</DialogTitle>
            <DialogDescription>
              Create and manage assignments for {classData?.name}
            </DialogDescription>
          </DialogHeader>
          {assignmentModalOpen && (
            <AssignmentManager 
              classId={parseInt(classId)} 
              onRefresh={handleAssignmentRefresh}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassDetailView; 