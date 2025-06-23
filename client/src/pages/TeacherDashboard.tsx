import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import AuthModal from '../components/AuthModal';
import TeacherAccessModal from '../components/TeacherAccessModal';
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
  Download
} from 'lucide-react';


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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [teacherAccessModalOpen, setTeacherAccessModalOpen] = useState(false);

  useEffect(() => {
    if (user && userProfile?.role === 'teacher') {
      fetchDashboardData();
    }
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockDashboardData: TeacherDashboardData = {
        classes: [
          {
            id: 1,
            name: 'Ethics in AI',
            description: 'Introduction to ethical considerations in AI',
            studentCount: 25,
            assignmentCount: 5,
            classCode: 'ETHICS2024',
            semester: 'Fall',
            schoolYear: '2024',
            isActive: true,
          },
          {
            id: 2,
            name: 'Advanced Ethics',
            description: 'Advanced ethical concepts and applications',
            studentCount: 18,
            assignmentCount: 3,
            classCode: 'ADVETH2024',
            semester: 'Fall',
            schoolYear: '2024',
            isActive: true,
          },
        ],
        overallStats: {
          totalStudents: 43,
          totalClasses: 2,
          totalAssignments: 8,
          averageEngagement: 0.78,
          pendingGrades: 12,
          flaggedContent: 3,
        },
        recentActivity: [
          {
            type: 'submission',
            message: 'New assignment submission from John Doe',
            timestamp: '2 hours ago',
            classId: 1,
            studentId: 2,
          },
          {
            type: 'discussion',
            message: 'Discussion flagged for review in Ethics 101',
            timestamp: '4 hours ago',
            classId: 1,
          },
        ],
        upcomingDeadlines: [
          {
            assignmentId: 1,
            title: 'AI Ethics Analysis',
            dueDate: '2024-10-20T23:59:59Z',
            className: 'Ethics in AI',
            submissionCount: 18,
            totalStudents: 25,
          },
        ],
      };
      
      setDashboardData(mockDashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    // Navigate to class creation form
    console.log('Create new class');
  };

  const handleViewClass = (classId: number) => {
    setSelectedClassId(classId);
    setSelectedTab('class-details');
  };

  if (!user || userProfile?.role !== 'teacher') {
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

  if (loading) {
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
                    <Button variant="link" className="p-0 h-auto text-orange-700">
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
                    <Button variant="link" className="p-0 h-auto text-red-700">
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
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Class Management</h3>
            <p className="text-gray-600">Detailed class management features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Student Analytics</h3>
            <p className="text-gray-600">Comprehensive analytics dashboard coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Assignment Manager</h3>
            <p className="text-gray-600">Assignment creation and management tools coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Content Moderation</h3>
            <p className="text-gray-600">Discussion moderation tools coming soon</p>
          </div>
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
    </div>
  );
} 