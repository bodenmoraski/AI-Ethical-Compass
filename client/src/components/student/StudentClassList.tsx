import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../../../lib/supabase-client';
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  Mail,
  Loader2,
  Plus,
  ExternalLink,
  LogOut
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  class_code: string;
  school_year: string;
  semester: string;
  is_active: boolean;
  teacher_name: string;
  teacher_email: string;
  enrollment_date: string;
  assignment_count: number;
  created_at: string;
}

export default function StudentClassList() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [leavingClass, setLeavingClass] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch enrolled classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/student?action=classes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      const data = await response.json();
      setClasses(data.classes || []);
      
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast({
        title: "Error loading classes",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle leave class button click
  const handleLeaveClick = (classItem: Class) => {
    setSelectedClass(classItem);
    setShowLeaveDialog(true);
  };

  // Confirm leave class
  const confirmLeaveClass = async () => {
    if (!selectedClass) return;
    
    setLeavingClass(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/student?action=leave-class', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          class_id: selectedClass.id
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave class');
      }
      
      toast({
        title: "Left Class",
        description: `You've successfully left ${selectedClass.name}`,
      });
      
      // Refresh class list
      await fetchClasses();
      
    } catch (err) {
      toast({
        title: "Error leaving class",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLeavingClass(false);
      setShowLeaveDialog(false);
      setSelectedClass(null);
    }
  };

  // Format enrollment date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Loading your enrolled classes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={fetchClasses} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Classes Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              You haven't joined any classes yet. Use a class code provided by your teacher to get started.
            </p>
            <Button 
              onClick={() => navigate('/join-class')}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Join a Class
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Classes list
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Classes ({classes.length})
              </CardTitle>
              <CardDescription>
                Classes you are currently enrolled in
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate('/join-class')}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Join Class
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classes.map((cls) => (
              <div 
                key={cls.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Class Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{cls.name}</h3>
                      {!cls.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {cls.subject} • {cls.grade_level}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {cls.class_code}
                  </Badge>
                </div>

                {/* Class Description */}
                {cls.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {cls.description}
                  </p>
                )}

                {/* Class Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Teacher:</span>
                    <span>{cls.teacher_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Assignments:</span>
                    <span>{cls.assignment_count}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Enrolled:</span>
                    <span>{formatDate(cls.enrollment_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{cls.teacher_email}</span>
                  </div>
                </div>

                {/* Term Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>{cls.school_year}</span>
                  <span>•</span>
                  <span>{cls.semester}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/class/${cls.id}`)}
                    className="flex-1 sm:flex-none"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleLeaveClick(cls)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Class
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave Class Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {selectedClass?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this class? You will no longer have access to assignments and materials. You'll need the class code to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leavingClass}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeaveClass}
              disabled={leavingClass}
              className="bg-red-600 hover:bg-red-700"
            >
              {leavingClass ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Leaving...
                </>
              ) : (
                'Leave Class'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

