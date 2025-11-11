import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, Loader2 } from 'lucide-react';

interface TeacherAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INSTITUTION_TYPES = [
  "Elementary School",
  "Middle School", 
  "High School",
  "Community College",
  "University",
  "Graduate School",
  "Professional Training",
  "Corporate Training",
  "Government Organization",
  "Non-profit Organization",
  "Private Tutoring",
  "Online Education",
  "Other"
];

export default function TeacherAccessModal({ isOpen, onClose }: TeacherAccessModalProps) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    institutionName: userProfile?.institutionName || '',
    institutionType: userProfile?.institutionType || '',
    department: '',
    requestReason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !userProfile?.username) {
      setError('User information not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teacher?action=access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`,
        },
        body: JSON.stringify({
          userEmail: user.email,
          institution_name: formData.institutionName || null,
          institution_type: formData.institutionType || null,
          department: formData.department || null,
          request_reason: formData.requestReason,
        }),
      });

      // Log the response for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Raw response:', responseText);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to submit teacher access request');
      }

      toast({
        title: "Teacher Access Granted! 🎉",
        description: "Your teacher access has been approved. Redirecting to teacher dashboard...",
      });

      // Close the modal
      onClose();

      // Refresh user profile to get updated role
      await refreshUserProfile();

      // Navigate to teacher dashboard
      navigate('/teacher/dashboard');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.requestReason.length >= 10;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-purple-100">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle>Request Teacher Access</DialogTitle>
              <DialogDescription>
                Get access to our comprehensive teacher dashboard and classroom management tools.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Institution Name */}
          <div className="space-y-2">
            <Label htmlFor="institutionName">Institution Name</Label>
            <Input
              id="institutionName"
              type="text"
              value={formData.institutionName}
              onChange={(e) => handleChange('institutionName', e.target.value)}
              placeholder="Enter your school or organization name"
            />
          </div>

          {/* Institution Type */}
          <div className="space-y-2">
            <Label htmlFor="institutionType">Institution Type</Label>
            <Select
              value={formData.institutionType}
              onValueChange={(value) => handleChange('institutionType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select institution type" />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Input
              id="department"
              type="text"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="e.g., Computer Science, Ethics, Philosophy"
            />
          </div>

          {/* Request Reason */}
          <div className="space-y-2">
            <Label htmlFor="requestReason">
              Why do you need teacher access? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requestReason"
              value={formData.requestReason}
              onChange={(e) => handleChange('requestReason', e.target.value)}
              placeholder="Please describe how you plan to use the teacher dashboard and your educational goals..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Minimum 10 characters ({formData.requestReason.length}/10)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Access'
              )}
            </Button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What you'll get:</strong> Access to student analytics, assignment creation, 
            real-time classroom monitoring, and comprehensive grading tools.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 