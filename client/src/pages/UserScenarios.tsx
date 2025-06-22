import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../lib/auth';
import { ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Sparkles, Brain, AlertTriangle } from 'lucide-react';

interface UserScenario {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  author_name: string;
  author_email: string;
  status: 'pending' | 'approved' | 'rejected';
  moderation_notes?: string;
  ai_analysis?: {
    quality_score: number;
    suggestions: string[];
    moderated_at: string;
  };
  votes_up: number;
  votes_down: number;
  is_featured: boolean;
  created_at: string;
}

interface ModerationResult {
  is_appropriate: boolean;
  quality_score: number;
  issues: string[];
  suggestions: string[];
  category_suggestion: string;
  difficulty_suggestion: string;
}

export default function UserScenarios() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<UserScenario[]>([]);
  const [myScenarios, setMyScenarios] = useState<UserScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [moderationFeedback, setModerationFeedback] = useState<ModerationResult | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchScenarios();
    if (user) {
      fetchMyScenarios();
    }
  }, [user]);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/user-scenarios');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyScenarios = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user-scenarios?author_email=${encodeURIComponent(user.email)}&status=all`);
      if (response.ok) {
        const data = await response.json();
        setMyScenarios(data);
      }
    } catch (error) {
      console.error('Error fetching my scenarios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setModerationFeedback(null);

    try {
      const response = await fetch('/api/user-scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          author_name: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
          author_email: user.email,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setModerationFeedback(result.moderation);
        setFormData({ title: '', description: '', category: '' });
        
        // Refresh scenarios
        fetchScenarios();
        fetchMyScenarios();
        
        if (result.moderation.is_appropriate) {
          setShowForm(false);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting scenario:', error);
      alert('Failed to submit scenario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (scenarioId: number, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      const response = await fetch('/api/user-scenarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_id: scenarioId,
          user_email: user.email,
          vote_type: voteType,
        }),
      });

      if (response.ok) {
        fetchScenarios();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const ScenarioCard = ({ scenario, showVoting = true }: { scenario: UserScenario; showVoting?: boolean }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{scenario.title}</CardTitle>
            <CardDescription className="mt-1">
              By {scenario.author_name} • {new Date(scenario.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {scenario.is_featured && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge className={getStatusColor(scenario.status)}>
              {getStatusIcon(scenario.status)}
              <span className="ml-1 capitalize">{scenario.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{scenario.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{scenario.category}</Badge>
          <Badge variant="outline">{scenario.difficulty_level}</Badge>
        </div>

        {scenario.ai_analysis && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">AI Quality Analysis</span>
              <Badge variant="outline" className="ml-auto">
                {Math.round(scenario.ai_analysis.quality_score * 100)}% Quality
              </Badge>
            </div>
            {scenario.ai_analysis.suggestions.length > 0 && (
              <ul className="text-sm text-blue-700 list-disc list-inside">
                {scenario.ai_analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {scenario.moderation_notes && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {scenario.moderation_notes}
            </AlertDescription>
          </Alert>
        )}

        {showVoting && scenario.status === 'approved' && (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(scenario.id, 'up')}
              disabled={!user}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {scenario.votes_up}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(scenario.id, 'down')}
              disabled={!user}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              {scenario.votes_down}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Scenarios</h1>
          <p className="text-gray-600">
            Explore ethical dilemmas created by our community, or submit your own for others to discuss.
          </p>
        </div>

        {user && (
          <div className="mb-6">
            <Button
              onClick={() => setShowForm(!showForm)}
              className="mb-4"
            >
              {showForm ? 'Cancel' : 'Submit New Scenario'}
            </Button>

            {showForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Submit New Scenario</CardTitle>
                  <CardDescription>
                    Create an ethical dilemma for the community to explore. Our AI will review it for quality and appropriateness.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="A compelling title for your scenario"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the ethical dilemma in detail. What are the key stakeholders, competing values, and potential consequences?"
                        rows={6}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Category (Optional)</label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., AI Ethics, Medical Ethics, Environmental Ethics"
                      />
                    </div>
                    
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Analyzing...' : 'Submit Scenario'}
                    </Button>
                  </form>

                  {moderationFeedback && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">AI Moderation Results</h3>
                      <div className={`p-4 rounded-lg ${moderationFeedback.is_appropriate ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {moderationFeedback.is_appropriate ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          )}
                          <span className="font-medium">
                            {moderationFeedback.is_appropriate ? 'Approved and Published!' : 'Needs Review'}
                          </span>
                          <Badge variant="outline" className="ml-auto">
                            Quality: {Math.round(moderationFeedback.quality_score * 100)}%
                          </Badge>
                        </div>
                        
                        {moderationFeedback.suggestions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Suggestions for improvement:</p>
                            <ul className="text-sm list-disc list-inside space-y-1">
                              {moderationFeedback.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {moderationFeedback.issues.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2 text-red-600">Issues found:</p>
                            <ul className="text-sm list-disc list-inside space-y-1 text-red-600">
                              {moderationFeedback.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="community">Community Scenarios</TabsTrigger>
            <TabsTrigger value="my-scenarios" disabled={!user}>
              My Scenarios {user && myScenarios.length > 0 && `(${myScenarios.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="community" className="mt-6">
            {loading ? (
              <div className="text-center py-8">Loading scenarios...</div>
            ) : scenarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No community scenarios yet. Be the first to submit one!
              </div>
            ) : (
              <div>
                {scenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-scenarios" className="mt-6">
            {!user ? (
              <div className="text-center py-8 text-gray-500">
                Please log in to view your scenarios.
              </div>
            ) : myScenarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven't submitted any scenarios yet.
              </div>
            ) : (
              <div>
                {myScenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} showVoting={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 