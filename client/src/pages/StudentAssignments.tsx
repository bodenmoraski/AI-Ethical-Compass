import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../lib/auth';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  BookOpen, 
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import StudentAssignmentList from '../components/student/StudentAssignmentList';
import StudentAssignmentView from '../components/student/StudentAssignmentView';

interface Assignment {
  id: number;
  title: string;
  description?: string;
  instructions?: string;
  assignment_type: 'scenario' | 'custom' | 'discussion';
  scenario_ids?: number[] | null;
  due_date?: string;
  points_possible: number;
  is_published: boolean;
  class_id: number;
  created_at: string;
  classes: {
    name: string;
    subject: string;
  };
  submission?: {
    id: number;
    status: string;
    submitted_at: string;
    final_score?: number;
    feedback?: string;
    submission_data: any;
  };
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAssignmentSelect = (assignment: Assignment) => {
    // Scenario assignments are completed inside ScenarioView with ?assignment=
    if (assignment.assignment_type === 'scenario') {
      const scenarioId = assignment.scenario_ids?.[0] || 1;
      navigate(`/scenarios/${scenarioId}?assignment=${assignment.id}`);
      return;
    }
    setSelectedAssignment(assignment);
  };

  const handleBackToList = () => {
    setSelectedAssignment(null);
  };

  const handleSubmissionComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setSelectedAssignment(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Login Required
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please log in to view your assignments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Assignments
            </h1>
            <p className="text-gray-600">
              Complete your assigned work and track your progress
            </p>
          </div>
          {selectedAssignment && (
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {selectedAssignment ? (
        <StudentAssignmentView
          assignment={selectedAssignment}
          onBack={handleBackToList}
          onSubmissionComplete={handleSubmissionComplete}
        />
      ) : (
        <StudentAssignmentList
          onAssignmentSelect={handleAssignmentSelect}
          key={refreshTrigger} // Force re-render when assignments are updated
        />
      )}
    </div>
  );
} 