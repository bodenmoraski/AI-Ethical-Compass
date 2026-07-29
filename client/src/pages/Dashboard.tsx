import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { useAuth } from '../lib/auth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase-client';
import { 
  MessageSquare, 
  Heart, 
  Target, 
  TrendingUp, 
  Book, 
  Award,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import StudentClassList from '../components/student/StudentClassList';

interface DashboardData {
  user_id: string;
  statistics: {
    total_perspectives: number;
    total_likes_received: number;
    total_likes_given: number;
    scenarios_engaged: number;
    scenarios_completed: number;
  };
  submitted_perspectives: Array<{
    id: number;
    content: string;
    scenario_id: number;
    author_name: string;
    likes: number;
    created_at: string;
    scenarios?: {
      id: number;
      title: string;
    };
  }>;
  liked_perspectives: Array<{
    id: number;
    content: string;
    scenario_id: number;
    author_name: string;
    likes: number;
    created_at: string;
    scenarios?: {
      id: number;
      title: string;
    };
  }>;
  scenario_progress: Array<{
    scenario_id: number;
    completed_at: string;
    perspectives_submitted: number;
    scenarios?: {
      id: number;
      title: string;
    };
  }>;
  sdg_impact: {
    primary_sdgs: number[];
    impact_score: number;
  };
  last_updated: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'perspectives';
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignmentStats, setAssignmentStats] = useState({
    total: 0,
    completed: 0,
    submitted: 0,
    overdue: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchAssignmentStats();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch('/api/user-dashboard', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentStats = async () => {
    if (!user) return;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch('/api/user-dashboard?action=assignments', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.ok) {
        const data = await response.json();
        const assignments = data.assignments || [];
        
        setAssignmentStats({
          total: assignments.length,
          completed: assignments.filter((a: any) => a.submission?.status === 'graded').length,
          submitted: assignments.filter((a: any) => a.submission?.status === 'submitted').length,
          overdue: assignments.filter((a: any) => 
            a.due_date && new Date(a.due_date) < new Date() && !a.submission
          ).length
        });
      }
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Login Required
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please log in to view your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
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
              <p>Error: {error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  const { statistics, submitted_perspectives, liked_perspectives, scenario_progress, sdg_impact } = dashboardData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your ethical AI learning progress and impact.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perspectives</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_perspectives}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Likes Received</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_likes_received}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scenarios</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.scenarios_engaged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold text-gray-900">{sdg_impact.impact_score}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Overview */}
      {assignmentStats.total > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Assignments
                </CardTitle>
                <CardDescription>
                  Your latest assignments and submission status
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/assignments')} variant="outline">
                View All Assignments
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {assignmentStats.total}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {assignmentStats.completed}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {assignmentStats.submitted}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {assignmentStats.overdue}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
            {assignmentStats.overdue > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You have {assignmentStats.overdue} overdue assignment{assignmentStats.overdue > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perspectives">My Perspectives</TabsTrigger>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="liked">Liked Content</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="perspectives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Your Perspectives ({submitted_perspectives.length})
              </CardTitle>
              <CardDescription>
                All the perspectives you've shared across different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted_perspectives.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>You haven't submitted any perspectives yet.</p>
                  <p>Start exploring scenarios to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submitted_perspectives.map((perspective) => (
                    <div key={perspective.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">
                          Scenario {perspective.scenario_id}: {perspective.scenarios?.title || 'Unknown'}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Heart className="h-4 w-4 mr-1" />
                          {perspective.likes}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{perspective.content}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(perspective.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <StudentClassList />
        </TabsContent>

        <TabsContent value="liked" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Perspectives You Liked ({liked_perspectives.length})
              </CardTitle>
              <CardDescription>
                Content that resonated with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liked_perspectives.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>You haven't liked any perspectives yet.</p>
                  <p>Explore scenarios and show appreciation for insightful content!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liked_perspectives.map((perspective) => (
                    <div key={perspective.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">
                          Scenario {perspective.scenario_id}: {perspective.scenarios?.title || 'Unknown'}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          {perspective.likes}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{perspective.content}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        by {perspective.author_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="mr-2 h-5 w-5" />
                  Scenario Progress
                </CardTitle>
                <CardDescription>
                  Your engagement across different ethical scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Scenarios Engaged</span>
                    <span>{statistics.scenarios_engaged} / 10</span>
                  </div>
                  <Progress value={(statistics.scenarios_engaged / 10) * 100} />
                  
                  {scenario_progress.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">Completed Scenarios:</h4>
                      {scenario_progress.map((progress) => (
                        <div key={progress.scenario_id} className="flex justify-between text-sm">
                          <span>Scenario {progress.scenario_id}</span>
                          <span>{progress.perspectives_submitted} perspectives</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  SDG Impact
                </CardTitle>
                <CardDescription>
                  Your contribution to Sustainable Development Goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Impact Score</span>
                    <span className="text-2xl font-bold text-green-600">{sdg_impact.impact_score}</span>
                  </div>
                  <Progress value={sdg_impact.impact_score} className="h-2" />
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Contributing to SDGs:</h4>
                    <div className="flex flex-wrap gap-2">
                      {sdg_impact.primary_sdgs.map((sdg) => (
                        <Badge key={sdg} variant="secondary">
                          SDG {sdg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 