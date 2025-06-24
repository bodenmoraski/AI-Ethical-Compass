import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../../../lib/supabase-client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  Users, 
  Loader2,
  CheckCircle
} from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description?: string;
  instructions?: string;
  assignment_type: 'scenario' | 'custom' | 'discussion';
  due_date?: string;
  points_possible: number;
  is_published: boolean;
  submission_count: number;
  class_id: number;
  created_at: string;
}

interface AssignmentManagerProps {
  classId: number;
  onRefresh?: () => void;
}

export default function AssignmentManager({ classId, onRefresh }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    assignment_type: 'scenario' as 'scenario' | 'custom' | 'discussion',
    due_date: '',
    points_possible: 100,
    is_published: false
  });

  const { toast } = useToast();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/teacher?action=assignments&classId=${classId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error loading assignments",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    try {
      setCreating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Format the due date properly
      const assignmentData = {
        ...formData,
        class_id: classId,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      const response = await fetch('/api/teacher?action=assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assignment');
      }

      toast({
        title: "Assignment created successfully!",
        description: `"${formData.title}" has been created.`,
      });

      setFormData({
        title: '',
        description: '',
        instructions: '',
        assignment_type: 'scenario',
        due_date: '',
        points_possible: 100,
        is_published: false
      });
      setCreateModalOpen(false);
      await fetchAssignments();
      onRefresh?.();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error creating assignment",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const updateAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      setEditing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Format the due date properly
      const assignmentData = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      const response = await fetch(`/api/teacher?action=assignments&assignmentId=${selectedAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assignment');
      }

      toast({
        title: "Assignment updated successfully!",
        description: `"${formData.title}" has been updated.`,
      });

      setEditModalOpen(false);
      setSelectedAssignment(null);
      await fetchAssignments();
      onRefresh?.();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error updating assignment",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setEditing(false);
    }
  };

  const deleteAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/teacher?action=assignments&assignmentId=${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assignment');
      }

      toast({
        title: "Assignment deleted successfully!",
        description: "The assignment has been removed.",
      });

      await fetchAssignments();
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error deleting assignment",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    
    // Format the due date for the datetime-local input
    let formattedDueDate = '';
    if (assignment.due_date) {
      const date = new Date(assignment.due_date);
      // Format as YYYY-MM-DDTHH:MM for datetime-local input
      formattedDueDate = date.toISOString().slice(0, 16);
    }
    
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      assignment_type: assignment.assignment_type,
      due_date: formattedDueDate,
      points_possible: assignment.points_possible,
      is_published: assignment.is_published
    });
    setEditModalOpen(true);
  };

  useEffect(() => {
    if (classId) {
      fetchAssignments();
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading assignments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Assignment Management</h3>
          <p className="text-gray-600">Create and manage assignments for your students</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {/* Assignments Grid */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first assignment to get started with student assessments.
              </p>
              <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Create Your First Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {assignment.assignment_type} • {assignment.points_possible} points
                    </CardDescription>
                  </div>
                  <Badge variant={assignment.is_published ? "default" : "secondary"}>
                    {assignment.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {assignment.description || "No description provided"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      <Users className="inline h-4 w-4 mr-1" />
                      {assignment.submission_count} submissions
                    </span>
                    {assignment.due_date && (
                      <span className="text-gray-600">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(assignment)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteAssignment(assignment.id)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Set up a new assignment for your students to complete.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., AI Ethics Analysis, Discussion Post"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the assignment"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Detailed instructions for students"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignment_type">Assignment Type</Label>
                <Select 
                  value={formData.assignment_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, assignment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scenario">Scenario Analysis</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="custom">Custom Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="points_possible">Points Possible</Label>
                <Input
                  id="points_possible"
                  type="number"
                  value={formData.points_possible}
                  onChange={(e) => setFormData(prev => ({ ...prev, points_possible: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={1000}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_published">Publish immediately</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              onClick={createAssignment}
              disabled={creating || !formData.title}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update the assignment details and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Assignment Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., AI Ethics Analysis, Discussion Post"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the assignment"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Detailed instructions for students"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assignment_type">Assignment Type</Label>
                <Select 
                  value={formData.assignment_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, assignment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scenario">Scenario Analysis</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="custom">Custom Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-points_possible">Points Possible</Label>
                <Input
                  id="edit-points_possible"
                  type="number"
                  value={formData.points_possible}
                  onChange={(e) => setFormData(prev => ({ ...prev, points_possible: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={1000}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-due_date">Due Date (Optional)</Label>
              <Input
                id="edit-due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit-is_published">Published</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setEditModalOpen(false)}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateAssignment}
              disabled={editing || !formData.title}
            >
              {editing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Assignment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 