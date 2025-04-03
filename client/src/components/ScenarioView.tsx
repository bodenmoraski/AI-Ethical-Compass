import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { type Scenario, type Perspective } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { submitPerspective, updateProgress, getRelativeTimeString } from "@/lib/scenarios";
import RelatedResources from "./RelatedResources";

enum Step {
  Identification = 1,
  Evaluation = 2,
  Submission = 3,
  Viewing = 4,
}

const ScenarioView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scenarioId = params.id ? parseInt(params.id) : null;

  const [currentStep, setCurrentStep] = useState<Step>(Step.Identification);
  const [aiOptionSelection, setAiOptionSelection] = useState<string | null>(null);
  
  // Form state for evaluation step
  const [evaluationResponses, setEvaluationResponses] = useState({
    appropriateness: "",
    benefits: "",
    risks: "",
    inclusion: "",
    responsible: "",
  });
  
  // Form state for perspective submission
  const [perspectiveContent, setPerspectiveContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  
  // Fetch scenario data
  const { data: scenarios = [] } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });
  
  const currentScenario = scenarioId 
    ? scenarios.find(s => s.id === scenarioId) 
    : scenarios[0];

  // Fetch perspectives for the current scenario
  const { data: perspectives = [] } = useQuery<Perspective[]>({
    queryKey: ["/api/scenarios", scenarioId, "perspectives"],
    enabled: !!scenarioId && currentStep === Step.Viewing,
  });

  // Navigate to first scenario if none selected and scenarios are loaded
  useEffect(() => {
    if (!scenarioId && scenarios.length > 0) {
      navigate(`/scenarios/${scenarios[0].id}`);
    }
  }, [scenarioId, scenarios, navigate]);
  
  // Reset form state when scenario changes
  useEffect(() => {
    setCurrentStep(Step.Identification);
    setAiOptionSelection(null);
    setEvaluationResponses({
      appropriateness: "",
      benefits: "",
      risks: "",
      inclusion: "",
      responsible: "",
    });
    setPerspectiveContent("");
  }, [scenarioId]);

  // Mutate perspective submission
  const perspectiveMutation = useMutation({
    mutationFn: ({ scenarioId, content }: { scenarioId: number, content: string }) => 
      submitPerspective(scenarioId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenarios", scenarioId, "perspectives"] });
      toast({
        title: "Perspective submitted",
        description: "Thank you for sharing your thoughts on this ethical dilemma.",
      });
      setCurrentStep(Step.Viewing);
      setPerspectiveContent("");
      // Update progress
      updateProgress(scenarioId!, true);
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your perspective. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission for perspective
  const handlePerspectiveSubmit = () => {
    if (!perspectiveContent.trim() || !scenarioId) return;
    
    perspectiveMutation.mutate({
      scenarioId,
      content: perspectiveContent
    });
  };

  // Handle navigation between scenarios
  const navigateToScenario = (direction: 'prev' | 'next') => {
    if (!currentScenario || !scenarios.length) return;
    
    const currentIndex = scenarios.findIndex(s => s.id === currentScenario.id);
    if (currentIndex === -1) return;
    
    let targetIndex;
    if (direction === 'prev') {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : scenarios.length - 1;
    } else {
      targetIndex = currentIndex < scenarios.length - 1 ? currentIndex + 1 : 0;
    }
    
    navigate(`/scenarios/${scenarios[targetIndex].id}`);
  };

  // Handle changes to evaluation form fields
  const handleEvaluationChange = (field: keyof typeof evaluationResponses, value: string) => {
    setEvaluationResponses(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if scenario data is loaded
  if (!currentScenario) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading scenario...</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Current Scenario */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900" id="scenario-title">
                Scenario {currentScenario.order}: {currentScenario.title}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {currentScenario.sdgTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className={index === 0 ? "bg-primary-100 text-primary-800" : "bg-accent-100 text-accent-800"}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => navigateToScenario('prev')}
                aria-label="Previous scenario"
              >
                <span className="material-icons text-lg">arrow_back</span>
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => navigateToScenario('next')}
                aria-label="Next scenario"
              >
                <span className="material-icons text-lg">arrow_forward</span>
              </Button>
            </div>
          </div>
          
          <hr className="my-5 border-neutral-200" />
          
          {/* Scenario Content */}
          <div className="prose max-w-none">
            {currentScenario.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          
          {/* Step 1: AI Use Identification */}
          {currentStep === Step.Identification && (
            <div className="mt-8" id="step-ai-identification">
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Step 1: Identify the AI Use</h3>
              <p className="mb-4 text-neutral-700">Do you think AI was used in this scenario? If so, how might it have been used?</p>
              
              <RadioGroup 
                value={aiOptionSelection || ""} 
                onValueChange={setAiOptionSelection}
              >
                {currentScenario.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-2 py-2">
                    <RadioGroupItem value={option} id={`ai-option-${index}`} />
                    <Label 
                      htmlFor={`ai-option-${index}`} 
                      className="font-medium text-neutral-700"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="mt-5">
                <Button 
                  onClick={() => setCurrentStep(Step.Evaluation)} 
                  disabled={!aiOptionSelection}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Ethical Evaluation */}
          {currentStep === Step.Evaluation && (
            <div className="mt-8" id="step-ethical-evaluation">
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Step 2: Evaluate the Ethics</h3>
              <Alert className="mb-5 bg-green-50 text-green-800 border-green-200">
                <span className="material-icons text-green-500 mr-2">info</span>
                <AlertTitle>AI Use in This Scenario</AlertTitle>
                <AlertDescription>
                  {currentScenario.aiUseAnswer}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="appropriateness" className="block text-sm font-medium text-neutral-900">
                    Was the use of AI in this scenario appropriate? Why or why not?
                  </Label>
                  <Textarea
                    id="appropriateness"
                    value={evaluationResponses.appropriateness}
                    onChange={(e) => handleEvaluationChange('appropriateness', e.target.value)}
                    placeholder="Share your thoughts..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="benefits" className="block text-sm font-medium text-neutral-900">
                    What are the potential benefits of using AI in this way?
                  </Label>
                  <Textarea
                    id="benefits"
                    value={evaluationResponses.benefits}
                    onChange={(e) => handleEvaluationChange('benefits', e.target.value)}
                    placeholder="Consider benefits for different stakeholders..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="risks" className="block text-sm font-medium text-neutral-900">
                    What are the potential risks or drawbacks?
                  </Label>
                  <Textarea
                    id="risks"
                    value={evaluationResponses.risks}
                    onChange={(e) => handleEvaluationChange('risks', e.target.value)}
                    placeholder="Consider issues like bias, plagiarism, learning impact..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inclusion" className="block text-sm font-medium text-neutral-900">
                    How does this relate to digital inclusion or exclusion?
                  </Label>
                  <Textarea
                    id="inclusion"
                    value={evaluationResponses.inclusion}
                    onChange={(e) => handleEvaluationChange('inclusion', e.target.value)}
                    placeholder="Consider access, equity, language barriers..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="responsible" className="block text-sm font-medium text-neutral-900">
                    What would constitute responsible use in this scenario?
                  </Label>
                  <Textarea
                    id="responsible"
                    value={evaluationResponses.responsible}
                    onChange={(e) => handleEvaluationChange('responsible', e.target.value)}
                    placeholder="Consider disclosure, guidelines, policies..."
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={() => setCurrentStep(Step.Submission)}
                  disabled={Object.values(evaluationResponses).some(val => !val.trim())}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Perspective Submission */}
          {currentStep === Step.Submission && (
            <div className="mt-8" id="step-perspective-submission">
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Step 3: Share Your Perspective</h3>
              <p className="mb-4 text-neutral-700">
                Submit your overall perspective on this ethical dilemma. Your response will be shared anonymously with other users.
              </p>
              
              <div>
                <Label htmlFor="perspective" className="block text-sm font-medium text-neutral-900">
                  Your Perspective
                </Label>
                <Textarea
                  id="perspective"
                  value={perspectiveContent}
                  onChange={(e) => setPerspectiveContent(e.target.value)}
                  placeholder="Share your thoughts on the ethical implications of this scenario..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div className="mt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="anonymous" 
                    checked={isAnonymous} 
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="anonymous" className="font-medium text-neutral-700">
                      Keep my submission anonymous
                    </Label>
                    <p className="text-neutral-500 text-sm">All submissions are anonymous by default</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <Button 
                  onClick={handlePerspectiveSubmit}
                  disabled={!perspectiveContent.trim() || perspectiveMutation.isPending}
                >
                  {perspectiveMutation.isPending ? "Submitting..." : "Submit Perspective"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Perspective Viewing */}
          {currentStep === Step.Viewing && (
            <div className="mt-8" id="step-perspective-viewing">
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Step 4: Community Perspectives</h3>
              <p className="mb-4 text-neutral-700">
                Explore diverse viewpoints from others who have analyzed this scenario. 
                Remember that there often isn't a single "right" answer to ethical questions.
              </p>
              
              <Alert className="mb-6 bg-primary-50 border-primary-100">
                <span className="material-icons text-primary-400 mr-2">volunteer_activism</span>
                <AlertTitle>Your contribution matters!</AlertTitle>
                <AlertDescription>
                  Thank you for sharing your perspective. By engaging in these ethical discussions, 
                  you're helping to shape responsible AI use in education.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {perspectives.length > 0 ? (
                  perspectives.map((perspective) => (
                    <div key={perspective.id} className="bg-white border border-neutral-200 rounded-md shadow-sm p-4">
                      <div className="text-sm text-neutral-700">
                        <p>"{perspective.content}"</p>
                      </div>
                      <div className="mt-2 text-xs text-neutral-500">
                        Anonymous • {getRelativeTimeString(new Date(perspective.createdAt))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 italic">
                    No perspectives have been shared yet. Be the first to contribute!
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Step.Submission)}
                >
                  Add Another Perspective
                </Button>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => navigateToScenario('next')}
                >
                  Next Scenario
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Related Resources */}
      <RelatedResources resources={currentScenario.relatedResources} />
    </div>
  );
};

export default ScenarioView;
