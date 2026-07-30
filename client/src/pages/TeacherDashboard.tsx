import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import AuthModal from '../components/AuthModal';
import TeacherAccessModal from '../components/TeacherAccessModal';
import LiveClassroomMonitor from '../components/teacher/LiveClassroomMonitor';
import AssignmentManager from '../components/teacher/AssignmentManager';
import StudentManager from '../components/teacher/StudentManager';
import ModerationPanel from '../components/teacher/ModerationPanel';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  BarChart3,
  GraduationCap,
  MessageSquare,
  FileText,
  Settings,
  Plus,
  Eye,
  Edit,
  Download,
  Loader2
} from 'lucide-react';
import { supabase } from '../../../lib/supabase-client';


interface TeacherDashboardData {
  classes: Array<{
    id: number;
    name: string;
    description: string;
    studentCount: number;
    assignmentCount: number;
    classCode: string;
    semester: string;
    schoolYear: string;
    isActive: boolean;
    subject: string;
    grade_level: string;
  }>;
  overallStats: {
    totalStudents: number;
    totalClasses: number;
    totalAssignments: number;
    averageEngagement: number;
    pendingGrades: number;
    flaggedContent: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    classId?: number;
    studentId?: number;
  }>;
  upcomingDeadlines: Array<{
    assignmentId: number;
    title: string;
    dueDate: string;
    className: string;
    submissionCount: number;
    totalStudents: number;
  }>;
}

export default function TeacherDashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [teacherAccessModalOpen, setTeacherAccessModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // Debounced loading state to prevent flickering
  const [debouncedLoading, setDebouncedLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(loading);
    }, 300); // 300ms delay to prevent flickering
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Keep the active class valid as the class list loads or changes
  useEffect(() => {
    const list = dashboardData?.classes || [];
    if (list.length === 0) {
      setSelectedClassId(null);
      return;
    }
    setSelectedClassId((current) =>
      current !== null && list.some((cls) => cls.id === current) ? current : list[0].id
    );
  }, [dashboardData]);

  // Class creation state
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [classFormData, setClassFormData] = useState({
    name: '',
    subject: '',
    grade_level: '',
    description: '',
    school_year: new Date().getFullYear().toString(),
    semester: 'Fall'
  });

  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user's access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const authHeaders = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      // Fetch classes data
      const classesResponse = await fetch('/api/teacher?action=classes', {
        headers: authHeaders
      });

      if (!classesResponse.ok) {
        throw new Error('Failed to fetch teacher data');
      }

      const classesData = await classesResponse.json();

      // Fetch stats data
      const statsResponse = await fetch('/api/teacher?action=stats', {
        headers: authHeaders
      });

      let statsData = {
        averageEngagement: 0,
        pendingGrades: 0,
        flaggedContent: 0
      };

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          statsData = statsResult.stats;
        }
      } else {
        console.warn('Failed to fetch stats data, using defaults');
      }
      
      // Transform API data to match our interface
      const transformedData: TeacherDashboardData = {
        classes: classesData.classes?.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          description: cls.description || '',
          studentCount: cls.student_count || 0,
          assignmentCount: cls.assignment_count || 0,
          classCode: cls.class_code,
          semester: cls.semester || 'Fall',
          schoolYear: cls.school_year || new Date().getFullYear().toString(),
          isActive: cls.is_active !== false,
          subject: cls.subject || '',
          grade_level: cls.grade_level || ''
        })) || [],
        overallStats: {
          totalStudents: classesData.classes?.reduce((sum: number, cls: any) => sum + (cls.student_count || 0), 0) || 0,
          totalClasses: classesData.classes?.length || 0,
          totalAssignments: classesData.classes?.reduce((sum: number, cls: any) => sum + (cls.assignment_count || 0), 0) || 0,
          averageEngagement: statsData.averageEngagement,
          pendingGrades: statsData.pendingGrades,
          flaggedContent: statsData.flaggedContent,
        },
        recentActivity: [
          {
            type: 'info',
            message: 'Welcome to your teacher dashboard!',
            timestamp: 'Just now'
          }
        ],
        upcomingDeadlines: []
      };
      
      setDashboardData(transformedData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirect teachers from /teacher to /teacher/dashboard
  useEffect(() => {
    if (user && userProfile?.role === 'teacher' && location.pathname === '/teacher') {
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [user, userProfile, location.pathname, navigate]);

  useEffect(() => {
    if (user && userProfile?.role === 'teacher') {
      fetchDashboardData();
    }
  }, [user, userProfile, fetchDashboardData]);

  const handleCreateClass = () => {
    setCreateClassModalOpen(true);
  };

  const createClass = useCallback(async () => {
    try {
      setCreatingClass(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/teacher?action=classes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create class');
      }

      const newClass = await response.json();
      const createdClass = newClass.class || newClass;
      
      toast({
        title: "Class Created Successfully!",
        description: `"${classFormData.name}" has been created with code: ${createdClass.class_code}`,
      });

      // Reset form and close modal
      setClassFormData({
        name: '',
        subject: '',
        grade_level: '',
        description: '',
        school_year: new Date().getFullYear().toString(),
        semester: 'Fall'
      });
      setCreateClassModalOpen(false);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Error creating class:', err);
      toast({
        title: "Error Creating Class",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setCreatingClass(false);
    }
  }, [classFormData, fetchDashboardData, toast]);

  const handleViewClass = (classId: number) => {
    navigate(`/teacher/class/${classId}`);
  };

  if (!user || (userProfile?.role !== 'teacher' && userProfile?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4 mr-2" />
                🎓 Teacher Dashboard Access
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Empower Your Classroom with AI Ethics Education
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join thousands of educators using our comprehensive teacher dashboard to guide students through critical AI ethics scenarios, track engagement, and foster meaningful discussions.
              </p>
            </div>

            {/* Access Required Card */}
            <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Teacher Access Required
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    {!user 
                      ? "Sign in or create a teacher account to access the full dashboard with student management, assignment creation, and real-time classroom monitoring."
                      : "Your account needs teacher permissions to access this dashboard. Contact your administrator or upgrade your account."
                    }
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {!user ? (
                      <>
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          onClick={() => setAuthModalOpen(true)}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create Teacher Account
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-3 text-lg font-semibold"
                          onClick={() => setAuthModalOpen(true)}
                        >
                          <Users className="w-5 h-5 mr-2" />
                          Sign In
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => setTeacherAccessModalOpen(true)}
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Request Teacher Access
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Analytics</h3>
                    <p className="text-gray-600">Track engagement, progress, and participation across all your classes with detailed analytics and insights.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment Management</h3>
                    <p className="text-gray-600">Create, distribute, and grade AI ethics assignments with built-in rubrics and automated insights.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Monitoring</h3>
                    <p className="text-gray-600">Monitor classroom discussions in real-time with content moderation and engagement tracking.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom CTA */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Need help getting started? Check out our teacher tutorial.
              </p>
              <Button 
                variant="ghost" 
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                onClick={() => navigate('/tutorial/teacher')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Teacher Tutorial
              </Button>
            </div>
          </div>
        </div>
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
        
        {/* Teacher Access Modal */}
        <TeacherAccessModal
          isOpen={teacherAccessModalOpen}
          onClose={() => setTeacherAccessModalOpen(false)}
        />
      </div>
    );
  }

  if (debouncedLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="mx-auto h-12 w-12" />
              <p className="mt-2">Error: {error}</p>
              <Button onClick={fetchDashboardData} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  const { classes, overallStats, recentActivity, upcomingDeadlines } = dashboardData;
  const activeClass = classes.find((cls) => cls.id === selectedClassId) ?? classes[0] ?? null;

  const classSelector = classes.length > 1 && activeClass ? (
    <div className="flex items-center gap-2">
      <Label htmlFor="active-class" className="text-sm text-muted-foreground">
        Class
      </Label>
      <Select
        value={String(activeClass.id)}
        onValueChange={(value) => setSelectedClassId(Number(value))}
      >
        <SelectTrigger id="active-class" className="w-[240px]">
          <SelectValue placeholder="Select a class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={String(cls.id)}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.email?.split('@')[0]}! 👋
            </p>
          </div>
          <Button onClick={handleCreateClass} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(overallStats.averageEngagement * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      {(overallStats.pendingGrades > 0 || overallStats.flaggedContent > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {overallStats.pendingGrades > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-800">
                      {overallStats.pendingGrades} assignments need grading
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-orange-700"
                      onClick={() => setSelectedTab('assignments')}
                    >
                      Review pending grades →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {overallStats.flaggedContent > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-800">
                      {overallStats.flaggedContent} discussions flagged for review
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-red-700"
                      onClick={() => setSelectedTab('moderation')}
                    >
                      Review flagged content →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classes Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Classes</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCreateClass}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Class
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{cls.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{cls.studentCount} students</span>
                          <span>{cls.assignmentCount} assignments</span>
                          <Badge variant="secondary">{cls.classCode}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewClass(cls.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                      <div>
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Assignment Deadlines</CardTitle>
                <CardDescription>Assignments due soon in your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.assignmentId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{deadline.title}</h3>
                        <p className="text-sm text-gray-600">{deadline.className}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(deadline.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {deadline.submissionCount}/{deadline.totalStudents} submitted
                        </div>
                        <Progress 
                          value={(deadline.submissionCount / deadline.totalStudents) * 100} 
                          className="w-24 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <div className="space-y-6">
            {/* Class Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Class Management</h3>
                <p className="text-gray-600">Manage your classes, view student enrollments, and track assignments</p>
              </div>
              <Button onClick={handleCreateClass} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Class
              </Button>
            </div>

            {/* Classes Grid */}
            {classes.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first class to get started with managing students and assignments.
                    </p>
                    <Button onClick={handleCreateClass} className="flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      Create Your First Class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((cls) => (
                    <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{cls.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {cls.subject} • {cls.grade_level}
                            </CardDescription>
                          </div>
                          <Badge variant={cls.isActive ? "default" : "secondary"}>
                            {cls.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {cls.description || "No description provided"}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              <Users className="inline h-4 w-4 mr-1" />
                              {cls.studentCount} students
                            </span>
                            <span className="text-gray-600">
                              <FileText className="inline h-4 w-4 mr-1" />
                              {cls.assignmentCount} assignments
                            </span>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Class Code</div>
                            <div className="font-mono text-sm font-semibold text-gray-900">
                              {cls.classCode}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleViewClass(cls.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Student Analytics & Live Monitoring</h3>
                <p className="text-gray-600">Track student engagement and monitor classroom activity in real-time</p>
              </div>
              {classSelector}
            </div>

            {/* Real-time Classroom Monitor */}
            {activeClass ? (
              <LiveClassroomMonitor 
                classId={activeClass.id} 
                userId={Number(user?.id) || 0}
              />
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classes to monitor</h3>
                    <p className="text-gray-600 mb-6">
                      Create a class first to start monitoring student activity and engagement.
                    </p>
                    <Button onClick={handleCreateClass} className="flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      Create Your First Class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          {activeClass ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Assignment Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Managing assignments for: <span className="font-medium">{activeClass.name}</span>
                  </p>
                </div>
                {classSelector}
              </div>
              <AssignmentManager 
                classId={activeClass.id} 
                onRefresh={fetchDashboardData}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No classes to manage assignments for</h3>
                  <p className="text-gray-600 mb-6">
                    Create a class first to start creating and managing assignments.
                  </p>
                  <Button onClick={handleCreateClass} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Create Your First Class
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <ModerationPanel />
        </TabsContent>
      </Tabs>
      
      {/* Auth Modal for logged-in users */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      
      {/* Teacher Access Modal for logged-in users */}
      <TeacherAccessModal
        isOpen={teacherAccessModalOpen}
        onClose={() => setTeacherAccessModalOpen(false)}
      />

      {/* Create Class Modal */}
      <Dialog open={createClassModalOpen} onOpenChange={setCreateClassModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Set up a new class for your students. You'll get a unique class code to share with them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                value={classFormData.name}
                onChange={(e) => setClassFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Ethics in AI, Computer Science 101"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={classFormData.subject}
                onChange={(e) => setClassFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Computer Science, Ethics, Philosophy"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="grade_level">Grade Level *</Label>
              <Select 
                value={classFormData.grade_level} 
                onValueChange={(value) => setClassFormData(prev => ({ ...prev, grade_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Elementary">Elementary (K-5)</SelectItem>
                  <SelectItem value="Middle School">Middle School (6-8)</SelectItem>
                  <SelectItem value="High School">High School (9-12)</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                  <SelectItem value="Professional">Professional Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={classFormData.description}
                onChange={(e) => setClassFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the class content and objectives"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="school_year">School Year</Label>
                <Input
                  id="school_year"
                  type="number"
                  value={classFormData.school_year}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, school_year: e.target.value }))}
                  min={2020}
                  max={2030}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={classFormData.semester} 
                  onValueChange={(value) => setClassFormData(prev => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setCreateClassModalOpen(false)}
              disabled={creatingClass}
            >
              Cancel
            </Button>
            <Button 
              onClick={createClass}
              disabled={creatingClass || !classFormData.name || !classFormData.subject || !classFormData.grade_level}
            >
              {creatingClass ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Class
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 