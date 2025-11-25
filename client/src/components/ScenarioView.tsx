import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../lib/auth';
import PerspectiveCard from './PerspectiveCard';
import RelatedResources from './RelatedResources';
import { type Scenario, type Perspective } from '@shared/schema';
import { submitPerspective, updateProgress } from '../lib/scenarios';
import { Checkbox } from './ui/checkbox';
import scenariosData from '../../../shared/scenarios.json';

// Static scenarios data - no more API calls needed
const scenarios: Scenario[] = scenariosData.map((scenario: any) => ({
  ...scenario,
  options: scenario.options, // Keep full option objects with text and consequence
  aiUseAnswer: scenario.description,
  relatedResources: scenario.resources.map((res: any) => ({
    title: res.title,
    source: res.type,
    type: res.type,
    link: res.url
  })),
  order: scenario.id
}));

const ScenarioView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const scenarioId = params.id ? parseInt(params.id) : null;
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Current step in the scenario (1-5)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [ethicsRatings, setEthicsRatings] = useState<Record<string, number>>({});
  const [perspective, setPerspective] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('quality');
  const [assignmentMode, setAssignmentMode] = useState(false);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [showScenarioReference, setShowScenarioReference] = useState(false);
  const [submitAnonymously, setSubmitAnonymously] = useState(false);

  // Ref for perspective section to enable scroll-into-view
  const perspectiveSectionRef = useRef<HTMLDivElement>(null);

  // Get current scenario
  const currentScenario = scenarios.find(s => s.id === scenarioId);

  // Get or generate consistent resolution for this scenario
  const getScenarioResolution = (scenario: any) => {
    if (!scenario || !scenario.resolutions || scenario.resolutions.length === 0) {
      return null;
    }

    // For assignments, use a consistent resolution based on scenario ID and assignment ID
    if (assignmentMode && assignmentId) {
      const seed = scenario.id + assignmentId;
      const resolutionIndex = seed % scenario.resolutions.length;
      return scenario.resolutions[resolutionIndex];
    }

    // For regular mode, use a consistent resolution based on scenario ID and user session
    // This ensures the same user gets the same resolution for the same scenario
    const userSeed = scenario.id + (Math.floor(Date.now() / (1000 * 60 * 60 * 24))); // Changes daily
    const resolutionIndex = userSeed % scenario.resolutions.length;
    return scenario.resolutions[resolutionIndex];
  };

  const currentResolution = currentScenario ? getScenarioResolution(currentScenario) : null;

  // Check if this is part of an assignment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentParam = urlParams.get('assignment');
    if (assignmentParam) {
      setAssignmentMode(true);
      setAssignmentId(parseInt(assignmentParam));
    }
  }, []);

  // Reset form state when scenario changes
  useEffect(() => {
    setCurrentStep(1);
    setSelectedOption('');
    setEthicsRatings({});
    setPerspective('');
    setSubmitAnonymously(false);
    setIsSubmitting(false);
  }, [scenarioId]);

  // Scroll perspective section into view when reaching step 4
  useEffect(() => {
    if (currentStep === 4 && perspectiveSectionRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        perspectiveSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [currentStep]);

  // Fetch perspectives for current scenario
  const { data: perspectivesData, isLoading, error } = useQuery({
    queryKey: ["/api/perspectives", "rankings", scenarioId, sortBy, currentResolution?.id],
    queryFn: async () => {
      if (!scenarioId) return { perspectives: [], pagination: {}, ranking: {}, metadata: {} };
      let url = `/api/perspectives?action=rankings&scenarioId=${scenarioId}&rankBy=${sortBy}&limit=50`;
      if (currentResolution?.id) {
        url += `&resolutionId=${currentResolution.id}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch perspectives');
      return await response.json();
    },
    enabled: !!scenarioId && currentStep === 5,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Submit perspective mutation
  const submitMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!scenarioId) throw new Error('No scenario selected');
      
      // If this is part of an assignment, submit to assignment system
      if (assignmentMode && assignmentId) {
        const response = await fetch('/api/user-dashboard?action=submit-assignment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.email}`,
          },
          body: JSON.stringify({
            assignmentId,
            submissionData: {
              scenarioId,
              selectedOption,
              ethicsRatings,
              perspective: content,
              completedAt: new Date().toISOString()
            }
          }),
        });
        
        if (!response.ok) throw new Error('Failed to submit assignment');
        return await response.json();
      } else {
        // Regular perspective submission
        return await submitPerspective(
          scenarioId,
          content,
          submitAnonymously ? 'Anonymous User' : (userProfile?.username || user?.email?.split('@')[0] || 'Anonymous User'),
          submitAnonymously ? undefined : user?.id,
          submitAnonymously ? undefined : user?.email,
          currentResolution?.id || null
        );
      }
    },
    onSuccess: async (result) => {
      if (assignmentMode) {
        toast({
          title: "Assignment Submitted!",
          description: "Your assignment has been submitted successfully.",
        });
        navigate('/assignments');
      } else {
        setPerspective('');
        setCurrentStep(5);
        toast({
          title: "Perspective Shared!",
          description: submitAnonymously 
            ? "Thank you for sharing your thoughtful perspective anonymously."
            : "Thank you for sharing your thoughtful perspective.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/perspectives", "rankings", scenarioId] });
      }
    },
    onError: (error: any) => {
      console.log('Error object:', error);
      console.log('Error data:', error?.data);
      console.log('Full error data:', JSON.stringify(error?.data, null, 2));
      
      // Check if this is a moderation error with helpful feedback
      const hasModeration = error?.data?.moderation_result || (error?.data?.issues && error?.data?.suggestions);
      console.log('Has moderation data:', hasModeration);
      
      if (hasModeration) {
        const { issues, suggestions } = error.data;
        
        const isRejected = error?.data?.moderation_result?.moderation_action === 'reject';
        
        toast({
          title: isRejected ? "❌ Perspective Needs Revision" : "✨ Let's improve your perspective",
          description: (
            <div className="space-y-3">
                            <p className={`text-sm font-medium ${isRejected ? 'text-red-100' : 'text-orange-100'}`}>
                 {isRejected 
                   ? "Your perspective was not accepted. Please revise and try again."
                   : "Your perspective was flagged by our content moderation system."
                 }
              </p>
              {issues && issues.length > 0 && (
                <div className="bg-red-50 p-2 rounded border border-red-200">
                  <p className="text-xs font-medium text-red-800 mb-1">Issues to address:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {issues.slice(0, 2).map((issue: string, index: number) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {suggestions && suggestions.length > 0 && (
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <p className="text-xs font-medium text-blue-800 mb-1">💡 Try this instead:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className={`text-xs italic ${isRejected ? 'text-red-200' : 'text-orange-200'}`}>
                {isRejected 
                  ? "Please revise your response to address the issues above and try again."
                  : "Please revise your response and try submitting again."
                }
              </p>
            </div>
          ),
          variant: "destructive",
          duration: 10000, // Show longer for detailed feedback
        });
      } else {
        // Generic error handling for other types of errors
        toast({
          title: "Submission Failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const handleSubmitPerspective = async () => {
    if (!perspective.trim()) {
      toast({
        title: "Please share your perspective",
        description: "Your perspective is required to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(perspective);
    } catch (error) {
      // Error is already handled by onError callback
      console.log('Mutation error caught in handleSubmitPerspective');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRatingChange = (category: string, value: number) => {
    setEthicsRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Get scenario-specific ethical considerations
  const getEthicalConsiderations = (scenarioId: number) => {
    const scenarioSpecific: Record<number, Array<{ key: string; label: string; description: string }>> = {
      1: [ // AI-Generated Essay
        { key: 'academic_integrity', label: 'Academic Integrity', description: 'Does this scenario maintain honest academic standards?' },
        { key: 'student_support', label: 'Student Support vs. Cheating', description: 'Is AI assistance helpful learning or academic dishonesty?' },
        { key: 'esl_fairness', label: 'ESL Student Fairness', description: 'Are non-native speakers fairly assessed in this context?' }
      ],
      2: [ // Facial Recognition in Schools
        { key: 'student_privacy', label: 'Student Privacy Rights', description: 'Are students\' privacy rights adequately protected?' },
        { key: 'security_vs_freedom', label: 'Security vs. Freedom', description: 'Is the security benefit worth the loss of privacy?' },
        { key: 'bias_accuracy', label: 'Recognition Bias & Accuracy', description: 'Does the system work fairly across all student populations?' }
      ],
      3: [ // AI Content Moderation
        { key: 'academic_freedom', label: 'Academic Freedom', description: 'Can students and teachers discuss sensitive topics freely?' },
        { key: 'censorship_risk', label: 'Over-Censorship Risk', description: 'Is legitimate educational content being inappropriately flagged?' },
        { key: 'context_understanding', label: 'Context Understanding', description: 'Does the AI understand educational vs. harmful content?' }
      ],
      4: [ // AI in College Admissions
        { key: 'admission_fairness', label: 'Admission Fairness', description: 'Does the AI system treat all applicants equitably?' },
        { key: 'algorithmic_bias', label: 'Algorithmic Bias', description: 'Could the system discriminate against certain groups?' },
        { key: 'human_oversight', label: 'Human Review Process', description: 'Is there adequate human oversight of AI decisions?' }
      ],
      5: [ // Accessibility AI Tools
        { key: 'inclusive_access', label: 'Inclusive Access', description: 'Do these tools truly help students with diverse needs?' },
        { key: 'assessment_fairness', label: 'Assessment Fairness', description: 'Do AI accommodations create unfair advantages?' },
        { key: 'tool_reliability', label: 'Tool Reliability', description: 'Are the AI tools accurate enough for educational use?' }
      ],
      6: [ // AI-Powered Tutoring
        { key: 'personalization_quality', label: 'Personalization Quality', description: 'Does the AI provide effective individualized learning?' },
        { key: 'human_interaction', label: 'Human vs. AI Interaction', description: 'Is the balance between AI and human tutoring appropriate?' },
        { key: 'learning_dependency', label: 'Learning Dependency', description: 'Could students become too reliant on AI assistance?' }
      ],
      7: [ // Predictive Analytics for Dropout Prevention
        { key: 'student_privacy', label: 'Student Data Privacy', description: 'Is student personal data being protected appropriately?' },
        { key: 'prediction_accuracy', label: 'Prediction Accuracy', description: 'Are the dropout predictions reliable and helpful?' },
        { key: 'intervention_effectiveness', label: 'Intervention Effectiveness', description: 'Do the AI-driven interventions actually help students?' }
      ],
      8: [ // AI Writing Feedback Tools
        { key: 'writing_development', label: 'Writing Skill Development', description: 'Do these tools help or hinder genuine writing improvement?' },
        { key: 'creativity_impact', label: 'Creativity Impact', description: 'Does AI feedback support or limit creative expression?' },
        { key: 'teacher_role', label: 'Teacher Role Balance', description: 'Is the balance between AI and teacher feedback appropriate?' }
      ],
      9: [ // AI-Enhanced Science Labs
        { key: 'hands_on_learning', label: 'Hands-on Learning Value', description: 'Do virtual labs provide adequate practical experience?' },
        { key: 'scientific_accuracy', label: 'Scientific Accuracy', description: 'Are the AI simulations scientifically accurate and unbiased?' },
        { key: 'lab_accessibility', label: 'Lab Accessibility', description: 'Do virtual labs improve access to advanced experiments?' }
      ],
      10: [ // AI Teacher Assistants
        { key: 'teacher_student_bond', label: 'Teacher-Student Relationship', description: 'Does AI assistance preserve meaningful human connections?' },
        { key: 'educational_quality', label: 'Educational Quality', description: 'Do AI assistants maintain or improve learning quality?' },
        { key: 'data_collection', label: 'Student Data Collection', description: 'Is the collection of student interaction data appropriate?' }
      ]
    };

    // Universal considerations that apply to all scenarios
    const universal = [
      { key: 'transparency', label: 'Transparency', description: 'Are the AI processes clear and understandable to users?' },
      { key: 'accountability', label: 'Accountability', description: 'Is there clear responsibility for AI-driven decisions?' },
      { key: 'overall_benefit', label: 'Overall Societal Benefit', description: 'Does this AI implementation benefit society overall?' }
    ];

    return [...(scenarioSpecific[scenarioId] || []), ...universal];
  };

  

  const handleOptionSelect = (optionText: string) => {
    setSelectedOption(optionText);
  };

  if (!currentScenario) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="text-neutral-400 mb-4">
            <span className="material-icons text-4xl">search_off</span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Scenario Not Found</h2>
          <p className="text-neutral-600">The requested scenario could not be found.</p>
          <Button onClick={() => navigate('/scenarios')} className="mt-4">
            <span className="material-icons mr-2">arrow_back</span>
            Back to Scenarios
          </Button>
        </Card>
      </div>
    );
  }

  const currentScenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
  const nextScenario = scenarios[currentScenarioIndex + 1];
  const prevScenario = scenarios[currentScenarioIndex - 1];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation when not typing in an input/textarea
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      if (event.altKey) {
        switch (event.code) {
          case 'ArrowLeft':
            event.preventDefault();
            if (prevScenario) {
              navigate(`/scenarios/${prevScenario.id}`);
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (nextScenario) {
              navigate(`/scenarios/${nextScenario.id}`);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevScenario, nextScenario, navigate]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scenario Navigation */}
      <Card className="border-l-4 border-l-primary-500">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Scenario Selector */}
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Current Scenario:
              </label>
              <Select 
                value={scenarioId?.toString()} 
                onValueChange={(value) => navigate(`/scenarios/${value}`)}
              >
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scenario.title}</span>
                        <div className="flex gap-1">
                          {scenario.sdgDetails?.slice(0, 2).map((sdg: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              SDG {sdg.goal.match(/\d+/)?.[0]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => prevScenario && navigate(`/scenarios/${prevScenario.id}`)}
                disabled={!prevScenario}
                className="flex items-center gap-1"
              >
                <span className="material-icons text-sm">chevron_left</span>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => nextScenario && navigate(`/scenarios/${nextScenario.id}`)}
                disabled={!nextScenario}
                className="flex items-center gap-1"
              >
                Next
                <span className="material-icons text-sm">chevron_right</span>
              </Button>
            </div>
          </div>
          
          {/* Scenario Info */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Scenario {currentScenarioIndex + 1} of {scenarios.length}</span>
              <span>•</span>
              <div className="flex gap-1">
                {currentScenario.sdgDetails?.map((sdg: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <span className="material-icons text-xs mr-1">{sdg.icon}</span>
                    {sdg.goal.split(' ')[0]} {sdg.goal.match(/\d+/)?.[0]}
                  </Badge>
                ))}
              </div>
              <span>•</span>
              <span className="text-xs text-gray-500">
                💡 Use Alt + ← → to navigate between scenarios
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{currentScenario.title}</h1>
          {assignmentMode && (
            <Badge variant="secondary" className="mt-2">
              <span className="material-icons mr-1 text-sm">assignment</span>
              Assignment Mode
            </Badge>
          )}
        </div>
        <div className="text-sm text-neutral-600">
          Step {currentStep} of 5
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={(currentStep / 5) * 100} className="h-2" />

      {/* Scenario Reference - Show on all steps except step 1 */}
      {currentStep > 1 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={() => setShowScenarioReference(!showScenarioReference)}
              className="w-full justify-between p-2 h-auto"
            >
              <div className="flex items-center gap-2">
                <span className="material-icons text-blue-600">description</span>
                <span className="font-medium text-blue-900">Scenario Reference</span>
                <Badge variant="outline" className="text-xs">
                  {currentScenario.title}
                </Badge>
              </div>
              <span className={`material-icons text-blue-600 transition-transform ${
                showScenarioReference ? 'rotate-180' : ''
              }`}>
                expand_more
              </span>
            </Button>
            
            {showScenarioReference && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                    {currentScenario.description}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card className="min-h-[500px]">
        <CardContent className="p-8">
          {/* Step 1: Read Scenario */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-primary-600 text-2xl">description</span>
                <h2 className="text-xl font-semibold">Read the Scenario</h2>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                  {currentScenario.description}
                </p>
              </div>

              <div className="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="material-icons text-white text-lg">lightbulb</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="material-icons text-white">psychology</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Analysis Tips</h4>
                    <p className="text-blue-800 leading-relaxed">
                      Take your time to understand the scenario. Consider the <strong>stakeholders</strong>, <strong>technology involved</strong>, and potential <strong>implications</strong>. Think about different perspectives and ethical frameworks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Core Ethical Dilemma */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-primary-600 text-2xl">balance</span>
                <h2 className="text-xl font-semibold">Core Ethical Dilemma</h2>
              </div>

              <p className="text-neutral-700 mb-6 font-medium">
                {(currentScenario as any).dilemmaQuestion || "What ethical considerations are most important in this scenario?"}
              </p>

              <div className="space-y-3">
                {currentScenario.options.map((option: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedOption === option.text 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleOptionSelect(option.text)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        selectedOption === option.text 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {selectedOption === option.text && (
                          <span className="material-icons text-white text-sm">check</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          selectedOption === option.text ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {option.text}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{option.consequence}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Evaluate Ethics */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-primary-600 text-2xl">balance</span>
                <h2 className="text-xl font-semibold">Evaluate Ethical Implications</h2>
              </div>

              {/* Show the resolution/outcome */}
              {currentResolution && (
                <div className="relative mb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/60 rounded-2xl p-6 shadow-xl shadow-indigo-100/50">
                  {/* Subtle accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-t-2xl"></div>
                  
                  {/* Main content */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="material-icons text-white text-2xl">policy</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        📋 Outcome: {currentResolution.title}
                      </h4>
                      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-white/50 shadow-sm">
                        <p className="text-slate-700 leading-relaxed text-lg">{currentResolution.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom emphasis */}
                  <div className="mt-5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <p className="text-indigo-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                      <span className="material-icons text-lg">lightbulb</span>
                      <span>Base your analysis on this specific outcome</span>
                    </p>
                  </div>
                </div>
              )}

              <p className="text-neutral-700 mb-6">
                Based on the outcome above, rate the ethical considerations on a scale of 1-5, where 1 is "Very Concerning" and 5 is "Very Positive":
              </p>

                              <div className="space-y-6">
                 {getEthicalConsiderations(scenarioId || 1).map(({ key, label, description }) => (
                  <div key={key} className="space-y-3">
                    <div>
                      <h4 className="font-medium text-neutral-900">{label}</h4>
                      <p className="text-sm text-neutral-600">{description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-neutral-500 w-20">Very Concerning</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(value => (
                          <button
                            key={value}
                            onClick={() => handleRatingChange(key, value)}
                            className={`w-12 h-12 rounded-full border-2 font-bold text-lg transition-all transform hover:scale-105 ${
                              ethicsRatings[key as keyof typeof ethicsRatings] === value
                                ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-110'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-neutral-500 w-20">Very Positive</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Share Perspective */}
          {currentStep === 4 && (
            <div className="space-y-6" ref={perspectiveSectionRef}>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-primary-600 text-2xl">edit</span>
                <h2 className="text-xl font-semibold">Share Your Perspective</h2>
              </div>

              {/* Show the resolution/outcome */}
              {currentResolution && (
                <div className="relative mb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/60 rounded-2xl p-6 shadow-xl shadow-indigo-100/50">
                  {/* Subtle accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-t-2xl"></div>
                  
                  {/* Main content */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="material-icons text-white text-2xl">policy</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        📋 Outcome: {currentResolution.title}
                      </h4>
                      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-white/50 shadow-sm">
                        <p className="text-slate-700 leading-relaxed text-lg">{currentResolution.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom emphasis */}
                  <div className="mt-5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <p className="text-indigo-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                      <span className="material-icons text-lg">lightbulb</span>
                      <span>Base your analysis on this specific outcome</span>
                    </p>
                  </div>
                </div>
              )}

              <p className="text-neutral-700 mb-6">
                Based on the outcome above and your analysis, share your thoughts on this scenario. Consider whether you agree with the action taken, what you might have done differently, and your recommendations for similar situations.
              </p>

              <div className="space-y-4">
                <Textarea
                  placeholder="Share your perspective on the ethical implications of this scenario. What are the key considerations? What would you recommend?"
                  value={perspective}
                  onChange={(e) => setPerspective(e.target.value)}
                  className="min-h-32"
                  maxLength={2000}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {perspective.length}/2000 characters
                  </span>
                  <span className="text-sm text-neutral-600">
                    Minimum 50 characters required
                  </span>
                </div>

                {/* Anonymous submission option - only for non-assignment mode */}
                {!assignmentMode && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="anonymous-submit"
                      checked={submitAnonymously}
                      onCheckedChange={(checked) => setSubmitAnonymously(checked === true)}
                    />
                    <label
                      htmlFor="anonymous-submit"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Submit anonymously
                    </label>
                    <div className="ml-2 text-xs text-gray-500">
                      <span className="material-icons text-sm mr-1">info</span>
                      Your perspective will be shown as "Anonymous User"
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-icons text-yellow-600">lightbulb</span>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Tips for a thoughtful response:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Consider multiple stakeholder perspectives</li>
                      <li>• Address both benefits and risks</li>
                      <li>• Suggest practical solutions or guidelines</li>
                      <li>• Connect to broader ethical principles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Explore Community */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-primary-600 text-2xl">groups</span>
                <h2 className="text-xl font-semibold">Explore Community Perspectives</h2>
              </div>

              {/* Show which resolution these perspectives are for */}
              {currentResolution && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-amber-600 text-sm">info</span>
                    <p className="text-amber-800 text-sm">
                      <strong>Note:</strong> These perspectives are responding to the "{currentResolution.title}" outcome.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-neutral-700 mb-6">
                See how others have analyzed this scenario. You can learn from different viewpoints and approaches.
              </p>

              {/* Sort Options */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-neutral-700">Sort by:</span>
                <div className="flex gap-2">
                  {[
                    { value: 'quality', label: 'Quality Score' },
                    { value: 'recent', label: 'Most Recent' },
                    { value: 'likes', label: 'Most Liked' }
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Perspectives */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading perspectives...</p>
                  </div>
                ) : perspectivesData?.perspectives?.length > 0 ? (
                  perspectivesData.perspectives.map((perspective: Perspective) => (
                    <PerspectiveCard 
                      key={perspective.id} 
                      perspective={perspective} 
                      scenarioId={scenarioId!}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="material-icons text-4xl text-neutral-400 mb-4">forum</span>
                    <p className="text-neutral-600">No perspectives shared yet. Be the first to contribute!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <span className="material-icons mr-2">arrow_back</span>
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep === 4 ? (
            <Button
              onClick={handleSubmitPerspective}
              disabled={isSubmitting || perspective.length < 50}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {assignmentMode ? 'Submitting Assignment...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <span className="material-icons">send</span>
                  {assignmentMode ? 'Submit Assignment' : 'Submit & Continue'}
                </>
              )}
            </Button>
          ) : currentStep === 5 ? (
            <div className="flex gap-2">
              {prevScenario && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/scenarios/${prevScenario.id}`)}
                >
                  <span className="material-icons mr-2">skip_previous</span>
                  Previous Scenario
                </Button>
              )}
              {nextScenario && (
                <Button
                  onClick={() => navigate(`/scenarios/${nextScenario.id}`)}
                >
                  Next Scenario
                  <span className="material-icons ml-2">skip_next</span>
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 2 && selectedOption === '') ||
                (currentStep === 3 && Object.values(ethicsRatings).some(rating => rating === 0))
              }
            >
              Next
              <span className="material-icons ml-2">arrow_forward</span>
            </Button>
          )}
        </div>
      </div>

      {/* Related Resources */}
      {currentScenario.relatedResources && currentScenario.relatedResources.length > 0 && (
        <RelatedResources resources={currentScenario.relatedResources} />
      )}
    </div>
  );
};

export default ScenarioView;
