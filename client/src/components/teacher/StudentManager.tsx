import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../../../lib/supabase-client';
import { 
  UserPlus, 
  UserMinus, 
  Users, 
  Mail, 
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Student {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  enrollment_date: string;
  status: string;
  users: {
    id: number;
    email: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

interface StudentManagerProps {
  classId: number;
  onRefresh?: () => void;
}

export default function StudentManager({ classId, onRefresh }: StudentManagerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/teacher?action=students&classId=${classId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error loading students",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollStudent = async () => {
    if (!studentEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a student email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      setEnrolling(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/teacher?action=students&classId=${classId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentEmail: studentEmail.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enroll student');
      }

      toast({
        title: "Student enrolled successfully!",
        description: `${studentEmail} has been added to the class.`,
      });

      setStudentEmail('');
      setEnrollModalOpen(false);
      await fetchStudents();
      onRefresh?.();
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: "Error enrolling student",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  };

  const removeStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) {
      return;
    }

    try {
      setRemoving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/teacher?action=students&classId=${classId}&studentId=${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove student');
      }

      toast({
        title: "Student removed successfully!",
        description: "The student has been removed from the class.",
      });

      await fetchStudents();
      onRefresh?.();
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: "Error removing student",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setRemoving(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Student Management</h3>
          <p className="text-gray-600">Manage student enrollments and view class roster</p>
        </div>
        <Button onClick={() => setEnrollModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Enroll Student
        </Button>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</h3>
              <p className="text-gray-600 mb-6">
                Enroll your first student to start building your class roster.
              </p>
              <Button onClick={() => setEnrollModalOpen(true)} className="flex items-center gap-2 mx-auto">
                <UserPlus className="h-4 w-4" />
                Enroll Your First Student
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Class Roster ({students.length} students)</CardTitle>
            <CardDescription>Students currently enrolled in this class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {student.users.first_name && student.users.last_name 
                          ? `${student.users.first_name} ${student.users.last_name}`
                          : student.users.name || student.users.username || student.users.email
                        }
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {student.users.email}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Enrolled {new Date(student.enrollment_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeStudent(student.users.id)}
                      disabled={removing}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enroll Student Modal */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
            <DialogDescription>
              Add a student to your class by entering their email address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student-email">Student Email *</Label>
              <Input
                id="student-email"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Note:</p>
                  <p>The student must have an existing account on the platform. If they don't have an account, they'll need to sign up first.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setEnrollModalOpen(false)}
              disabled={enrolling}
            >
              Cancel
            </Button>
            <Button 
              onClick={enrollStudent}
              disabled={enrolling || !studentEmail.trim()}
            >
              {enrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Enroll Student
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 