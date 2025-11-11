import React, { useState } from 'react';
import SubmissionList from './SubmissionList';
import SubmissionGradingForm from './SubmissionGradingForm';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface AssignmentGradingViewProps {
  assignmentId: number;
  pointsPossible: number;
}

export default function AssignmentGradingView({ assignmentId, pointsPossible }: AssignmentGradingViewProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectSubmission = (submission: any) => {
    setSelectedSubmission(submission);
  };

  const handleGraded = (updated: any) => {
    setSelectedSubmission(updated);
    setRefreshKey(k => k + 1);
  };

  if (!selectedSubmission) {
    return (
      <SubmissionList
        key={refreshKey}
        assignmentId={assignmentId}
        onSelectSubmission={handleSelectSubmission}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(null)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Submissions
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Work */}
        <Card>
          <CardHeader>
            <CardTitle>Student Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-sm text-gray-600">
              <span className="font-medium">Student:</span> {selectedSubmission.users.first_name || ''} {selectedSubmission.users.last_name || ''} ({selectedSubmission.users.email})
            </div>
            <div className="mb-2 text-sm text-gray-600">
              <span className="font-medium">Submitted:</span> {new Date(selectedSubmission.submitted_at).toLocaleString()}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium mb-2">Perspective/Response:</div>
              <div className="whitespace-pre-wrap text-gray-800">
                {selectedSubmission.submission_data?.perspectives?.[0] || <span className="italic text-gray-400">No response</span>}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Grading Form */}
        <SubmissionGradingForm
          submission={selectedSubmission}
          pointsPossible={pointsPossible}
          onGraded={handleGraded}
        />
      </div>
    </div>
  );
} 