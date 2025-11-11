import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Save,
  Send,
  RotateCcw
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
}

interface EnhancedFeedbackFormProps {
  submissionId: number;
  studentName: string;
  assignmentTitle: string;
  currentScore?: number;
  currentFeedback?: string;
  rubric?: {
    criteria: RubricCriteria[];
    levels: Array<{
      id: string;
      name: string;
      points: number;
    }>;
  };
  onFeedbackSubmitted?: (feedback: any) => void;
  onCancel?: () => void;
}

export const EnhancedFeedbackForm: React.FC<EnhancedFeedbackFormProps> = ({
  submissionId,
  studentName,
  assignmentTitle,
  currentScore,
  currentFeedback,
  rubric,
  onFeedbackSubmitted,
  onCancel
}) => {
  const [feedback, setFeedback] = useState(currentFeedback || '');
  const [score, setScore] = useState(currentScore || 0);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [isPublic, setIsPublic] = useState(true);
  const [allowResubmission, setAllowResubmission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCalculatedScore, setAutoCalculatedScore] = useState(0);

  // Calculate auto score based on rubric
  useEffect(() => {
    if (rubric && Object.keys(rubricScores).length > 0) {
      let totalScore = 0;
      let totalWeight = 0;

      rubric.criteria.forEach(criteria => {
        const criteriaScore = rubricScores[criteria.id] || 0;
        const weightedScore = (criteriaScore / 100) * criteria.maxPoints;
        totalScore += weightedScore;
        totalWeight += criteria.weight;
      });

      const calculatedScore = totalWeight > 0 ? Math.round((totalScore / 100) * 100) : 0;
      setAutoCalculatedScore(calculatedScore);
      
      // Auto-update score if rubric scoring is used
      if (Object.keys(rubricScores).length === rubric.criteria.length) {
        setScore(calculatedScore);
      }
    }
  }, [rubricScores, rubric]);

  const handleRubricScoreChange = (criteriaId: string, value: number) => {
    setRubricScores(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/assignment-communication?action=enhanced-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          submissionId,
          feedback: feedback.trim(),
          score,
          rubricScores: Object.keys(rubricScores).length > 0 ? rubricScores : undefined,
          isPublic,
          allowResubmission
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Feedback Submitted",
          description: "Your feedback has been successfully submitted.",
        });
        onFeedbackSubmitted?.(result.feedback);
      } else {
        throw new Error(result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Save feedback as draft (local storage for now)
    const draft = {
      submissionId,
      feedback,
      score,
      rubricScores,
      isPublic,
      allowResubmission,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`feedback-draft-${submissionId}`, JSON.stringify(draft));
    
    toast({
      title: "Draft Saved",
      description: "Your feedback draft has been saved.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enhanced Feedback for {studentName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Assignment: {assignmentTitle}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Score Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="score">Overall Score</Label>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${getScoreColor(score)}`}>
                {score}%
              </span>
              <Badge variant="outline">{getScoreLabel(score)}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value) || 0)}
              className="w-32"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>0</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all ${getScoreColor(score).replace('text-', 'bg-')}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span>100</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rubric Scoring */}
        {rubric && (
          <div className="space-y-4">
            <h4 className="font-medium">Rubric Scoring</h4>
            <div className="space-y-4">
              {rubric.criteria.map((criteria) => (
                <div key={criteria.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{criteria.name}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {rubricScores[criteria.id] || 0}%
                      </span>
                      <Badge variant="outline">
                        {criteria.maxPoints} pts
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {criteria.description}
                  </p>
                  
                  <div className="space-y-2">
                    <Slider
                      value={[rubricScores[criteria.id] || 0]}
                      onValueChange={([value]) => handleRubricScoreChange(criteria.id, value)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {Object.keys(rubricScores).length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-calculated Score:</span>
                  <span className={`font-semibold ${getScoreColor(autoCalculatedScore)}`}>
                    {autoCalculatedScore}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Feedback Text */}
        <div className="space-y-2">
          <Label htmlFor="feedback">Detailed Feedback</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide detailed feedback on the student's work..."
            rows={6}
            className="resize-none"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{feedback.length} characters</span>
            <span>Minimum 10 characters</span>
          </div>
        </div>

        <Separator />

        {/* Options */}
        <div className="space-y-4">
          <h4 className="font-medium">Feedback Options</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="public-feedback">Public Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Student can see this feedback
              </p>
            </div>
            <Switch
              id="public-feedback"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allow-resubmission">Allow Resubmission</Label>
              <p className="text-sm text-muted-foreground">
                Student can submit revised work
              </p>
            </div>
            <Switch
              id="allow-resubmission"
              checked={allowResubmission}
              onCheckedChange={setAllowResubmission}
            />
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>

        {/* Feedback Preview */}
        {feedback.trim() && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium mb-2">Feedback Preview</h5>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{feedback}</p>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Score: {score}%</span>
              <span>Status: {isPublic ? 'Public' : 'Private'}</span>
              {allowResubmission && (
                <span className="flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" />
                  Resubmission Allowed
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedFeedbackForm; 