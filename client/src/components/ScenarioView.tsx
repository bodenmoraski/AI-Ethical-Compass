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
    impactRating: 3, // Default to middle value (1-5 scale)
    concernLevel: 3, // Default to middle value (1-5 scale)
    ethicalChoice: "", // Multiple choice selection
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
      impactRating: 3,
      concernLevel: 3,
      ethicalChoice: "",
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
  const handleEvaluationChange = (field: keyof typeof evaluationResponses, value: string | number) => {
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
              <div className="flex items-center mb-5 bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg border-l-4 border-primary-500">
                <div className="bg-primary-100 w-10 h-10 flex items-center justify-center rounded-full mr-4">
                  <span className="material-icons text-primary-600">psychology</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-primary-800">Step 1: Identify the AI Use</h3>
                  <p className="text-neutral-600">Do you think AI was used in this scenario? If so, how might it have been used?</p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
                <RadioGroup 
                  value={aiOptionSelection || ""} 
                  onValueChange={setAiOptionSelection}
                  className="space-y-3"
                >
                  {currentScenario.options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start space-x-3 p-3 rounded-md transition-all ${
                        aiOptionSelection === option 
                          ? 'bg-primary-50 border border-primary-200' 
                          : 'border border-transparent hover:bg-neutral-50'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option} 
                        id={`ai-option-${index}`} 
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`ai-option-${index}`} 
                        className={`font-medium cursor-pointer ${
                          aiOptionSelection === option ? 'text-primary-900' : 'text-neutral-700'
                        }`}
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setCurrentStep(Step.Evaluation)} 
                  disabled={!aiOptionSelection}
                  className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-8 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  size="lg"
                >
                  <span className="mr-2">Continue to Evaluation</span>
                  <span className="material-icons text-sm">arrow_forward</span>
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Ethical Evaluation */}
          {currentStep === Step.Evaluation && (
            <div className="mt-8" id="step-ethical-evaluation">
              <div className="flex items-center mb-5 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full mr-4">
                  <span className="material-icons text-blue-600">balance</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-800">Step 2: Evaluate the Ethics</h3>
                  <p className="text-neutral-600">
                    Consider the ethical implications of AI use in this scenario from multiple perspectives.
                  </p>
                </div>
              </div>
              
              <div className="mb-5 bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-lg border border-green-200 shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="material-icons text-green-600">lightbulb</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-green-800">AI Use in This Scenario</h4>
                    <p className="mt-2 text-green-800">
                      {currentScenario.aiUseAnswer}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100 mb-6">
                  <p className="text-blue-700 text-sm">
                    Taking time to thoughtfully consider different perspectives will help you develop a deeper understanding of AI ethics.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border border-neutral-100 bg-neutral-50 hover:border-blue-100 hover:bg-blue-50 transition-colors">
                  <Label htmlFor="appropriateness" className="flex items-center text-neutral-900 font-medium mb-2">
                    <span className="material-icons text-blue-500 mr-2">help_outline</span>
                    Was the use of AI in this scenario appropriate? Why or why not?
                  </Label>
                  <Textarea
                    id="appropriateness"
                    value={evaluationResponses.appropriateness}
                    onChange={(e) => handleEvaluationChange('appropriateness', e.target.value)}
                    placeholder="Share your thoughts..."
                    className="border-neutral-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div className="p-4 rounded-lg border border-neutral-100 bg-neutral-50 hover:border-green-100 hover:bg-green-50 transition-colors">
                  <Label htmlFor="benefits" className="flex items-center text-neutral-900 font-medium mb-2">
                    <span className="material-icons text-green-500 mr-2">add_circle_outline</span>
                    What are the potential benefits of using AI in this way?
                  </Label>
                  <Textarea
                    id="benefits"
                    value={evaluationResponses.benefits}
                    onChange={(e) => handleEvaluationChange('benefits', e.target.value)}
                    placeholder="Consider benefits for different stakeholders..."
                    className="border-neutral-300 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div className="p-4 rounded-lg border border-neutral-100 bg-neutral-50 hover:border-red-100 hover:bg-red-50 transition-colors">
                  <Label htmlFor="risks" className="flex items-center text-neutral-900 font-medium mb-2">
                    <span className="material-icons text-red-500 mr-2">error_outline</span>
                    What are the potential risks or drawbacks?
                  </Label>
                  <Textarea
                    id="risks"
                    value={evaluationResponses.risks}
                    onChange={(e) => handleEvaluationChange('risks', e.target.value)}
                    placeholder="Consider issues like bias, plagiarism, learning impact..."
                    className="border-neutral-300 focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div className="p-4 rounded-lg border border-neutral-100 bg-neutral-50 hover:border-purple-100 hover:bg-purple-50 transition-colors">
                  <Label htmlFor="inclusion" className="flex items-center text-neutral-900 font-medium mb-2">
                    <span className="material-icons text-purple-500 mr-2">diversity_3</span>
                    How does this relate to digital inclusion or exclusion?
                  </Label>
                  <Textarea
                    id="inclusion"
                    value={evaluationResponses.inclusion}
                    onChange={(e) => handleEvaluationChange('inclusion', e.target.value)}
                    placeholder="Consider access, equity, language barriers..."
                    className="border-neutral-300 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div className="p-4 rounded-lg border border-neutral-100 bg-neutral-50 hover:border-amber-100 hover:bg-amber-50 transition-colors">
                  <Label htmlFor="responsible" className="flex items-center text-neutral-900 font-medium mb-2">
                    <span className="material-icons text-amber-500 mr-2">policy</span>
                    What would constitute responsible use in this scenario?
                  </Label>
                  <Textarea
                    id="responsible"
                    value={evaluationResponses.responsible}
                    onChange={(e) => handleEvaluationChange('responsible', e.target.value)}
                    placeholder="Consider disclosure, guidelines, policies..."
                    className="border-neutral-300 focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
              
              {/* Add rating scales and multiple choice */}
              <div className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-blue-100 p-6 shadow-sm">
                <div className="flex items-center mb-5">
                  <div className="bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full mr-3">
                    <span className="material-icons text-blue-600">speed</span>
                  </div>
                  <h4 className="text-lg font-medium text-blue-800">Quick Assessments</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Impact rating scale */}
                  <div className="bg-white rounded-lg p-4 border border-neutral-200 shadow-sm">
                    <Label htmlFor="impactRating" className="flex items-center text-neutral-900 font-medium mb-3">
                      <span className="material-icons text-indigo-500 mr-2">trending_up</span>
                      Potential Educational Impact
                    </Label>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-neutral-600 px-2 mb-1">
                        <span>Low Impact</span>
                        <span>High Impact</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-500">1</span>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={evaluationResponses.impactRating}
                          onChange={(e) => handleEvaluationChange('impactRating', parseInt(e.target.value))}
                          className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-sm font-medium text-neutral-500">5</span>
                      </div>
                      <div className="text-center mt-2">
                        <span className="inline-block px-3 py-1 bg-indigo-500 text-white font-medium rounded-full text-sm">
                          {evaluationResponses.impactRating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Concern level scale */}
                  <div className="bg-white rounded-lg p-4 border border-neutral-200 shadow-sm">
                    <Label htmlFor="concernLevel" className="flex items-center text-neutral-900 font-medium mb-3">
                      <span className="material-icons text-amber-500 mr-2">warning</span>
                      Ethical Concern Level
                    </Label>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-neutral-600 px-2 mb-1">
                        <span>No Concerns</span>
                        <span>Serious Concerns</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-500">1</span>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={evaluationResponses.concernLevel}
                          onChange={(e) => handleEvaluationChange('concernLevel', parseInt(e.target.value))}
                          className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <span className="text-sm font-medium text-neutral-500">5</span>
                      </div>
                      <div className="text-center mt-2">
                        <span className="inline-block px-3 py-1 bg-amber-500 text-white font-medium rounded-full text-sm">
                          {evaluationResponses.concernLevel}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Multiple choice */}
                <div className="mt-6 bg-white rounded-lg p-4 border border-neutral-200 shadow-sm">
                  <Label className="flex items-center text-neutral-900 font-medium mb-3">
                    <span className="material-icons text-purple-500 mr-2">category</span>
                    Most Relevant Ethical Principle
                  </Label>
                  <RadioGroup 
                    value={evaluationResponses.ethicalChoice} 
                    onValueChange={(value) => handleEvaluationChange('ethicalChoice', value)}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2"
                  >
                    <div className={`flex items-center p-3 border rounded-md transition-all ${
                      evaluationResponses.ethicalChoice === 'fairness' 
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'border-neutral-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}>
                      <RadioGroupItem value="fairness" id="ethicalChoice-fairness" 
                        className="mr-2" />
                      <Label htmlFor="ethicalChoice-fairness" className="cursor-pointer font-medium">
                        Fairness & Equity
                      </Label>
                    </div>
                    <div className={`flex items-center p-3 border rounded-md transition-all ${
                      evaluationResponses.ethicalChoice === 'privacy' 
                        ? 'bg-green-50 border-green-300 shadow-sm' 
                        : 'border-neutral-200 hover:border-green-200 hover:bg-green-50'
                    }`}>
                      <RadioGroupItem value="privacy" id="ethicalChoice-privacy" 
                        className="mr-2" />
                      <Label htmlFor="ethicalChoice-privacy" className="cursor-pointer font-medium">
                        Privacy & Data Protection
                      </Label>
                    </div>
                    <div className={`flex items-center p-3 border rounded-md transition-all ${
                      evaluationResponses.ethicalChoice === 'transparency' 
                        ? 'bg-purple-50 border-purple-300 shadow-sm' 
                        : 'border-neutral-200 hover:border-purple-200 hover:bg-purple-50'
                    }`}>
                      <RadioGroupItem value="transparency" id="ethicalChoice-transparency" 
                        className="mr-2" />
                      <Label htmlFor="ethicalChoice-transparency" className="cursor-pointer font-medium">
                        Transparency & Explainability
                      </Label>
                    </div>
                    <div className={`flex items-center p-3 border rounded-md transition-all ${
                      evaluationResponses.ethicalChoice === 'safety' 
                        ? 'bg-red-50 border-red-300 shadow-sm' 
                        : 'border-neutral-200 hover:border-red-200 hover:bg-red-50'
                    }`}>
                      <RadioGroupItem value="safety" id="ethicalChoice-safety" 
                        className="mr-2" />
                      <Label htmlFor="ethicalChoice-safety" className="cursor-pointer font-medium">
                        Safety & Security
                      </Label>
                    </div>
                    <div className={`flex items-center p-3 border rounded-md transition-all ${
                      evaluationResponses.ethicalChoice === 'autonomy' 
                        ? 'bg-amber-50 border-amber-300 shadow-sm' 
                        : 'border-neutral-200 hover:border-amber-200 hover:bg-amber-50'
                    }`}>
                      <RadioGroupItem value="autonomy" id="ethicalChoice-autonomy" 
                        className="mr-2" />
                      <Label htmlFor="ethicalChoice-autonomy" className="cursor-pointer font-medium">
                        Human Autonomy & Agency
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={() => setCurrentStep(Step.Submission)}
                  disabled={
                    !evaluationResponses.appropriateness.trim() ||
                    !evaluationResponses.benefits.trim() ||
                    !evaluationResponses.risks.trim() ||
                    !evaluationResponses.inclusion.trim() ||
                    !evaluationResponses.responsible.trim() ||
                    !evaluationResponses.ethicalChoice
                  }
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-8 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  <span className="mr-2">Continue to Share Your Perspective</span>
                  <span className="material-icons text-sm">arrow_forward</span>
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Perspective Submission */}
          {currentStep === Step.Submission && (
            <div className="mt-8" id="step-perspective-submission">
              <div className="flex items-center mb-5 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border-l-4 border-indigo-500">
                <div className="bg-indigo-100 w-10 h-10 flex items-center justify-center rounded-full mr-4">
                  <span className="material-icons text-indigo-600">comment</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-indigo-800">Step 3: Share Your Perspective</h3>
                  <p className="text-neutral-600">
                    Submit your overall perspective on this ethical dilemma. Your response will be shared anonymously with other users.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                <div className="mb-5">
                  <Label htmlFor="perspective" className="block text-md font-medium text-neutral-900 mb-2">
                    Your Perspective
                  </Label>
                  <Textarea
                    id="perspective"
                    value={perspectiveContent}
                    onChange={(e) => setPerspectiveContent(e.target.value)}
                    placeholder="Share your thoughts on the ethical implications of this scenario..."
                    className="mt-1 w-full p-3 min-h-[120px] border-neutral-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md"
                    rows={4}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                  <div className="flex items-start">
                    <span className="material-icons text-blue-600 mr-2">tips_and_updates</span>
                    <p className="text-sm text-blue-800">
                      Consider including your thoughts on the balance between innovation and ethics, how different stakeholders might be affected, and what guidelines or policies could help ensure responsible AI use.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-start space-x-2 bg-neutral-50 p-3 rounded-md">
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
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handlePerspectiveSubmit}
                  disabled={!perspectiveContent.trim() || perspectiveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-8 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  size="lg"
                >
                  {perspectiveMutation.isPending ? (
                    <>
                      <span className="mr-2">Submitting...</span>
                      <span className="material-icons animate-spin text-sm">refresh</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Submit Perspective</span>
                      <span className="material-icons text-sm">send</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Perspective Viewing */}
          {currentStep === Step.Viewing && (
            <div className="mt-8" id="step-perspective-viewing">
              <div className="flex items-center mb-5 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-500">
                <div className="bg-green-100 w-10 h-10 flex items-center justify-center rounded-full mr-4">
                  <span className="material-icons text-green-600">groups</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-800">Step 4: Community Perspectives</h3>
                  <p className="text-neutral-600">
                    Explore diverse viewpoints from others who have analyzed this scenario. 
                    Remember that there often isn't a single "right" answer to ethical questions.
                  </p>
                </div>
              </div>
              
              <div className="mb-6 bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-lg p-5 shadow-sm">
                <div className="flex items-start">
                  <span className="material-icons text-primary-500 mr-3 text-2xl">volunteer_activism</span>
                  <div>
                    <h4 className="text-lg font-medium text-primary-800">Your contribution matters!</h4>
                    <p className="text-primary-700 mt-1">
                      Thank you for sharing your perspective. By engaging in these ethical discussions, 
                      you're helping to shape responsible AI use in education.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {perspectives.length > 0 ? (
                  perspectives.map((perspective) => (
                    <div key={perspective.id} className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-md shadow-md p-5 transition-all hover:shadow-lg">
                      <div className="flex">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                            <span className="material-icons">person</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-neutral-700 italic">
                            <p>"{perspective.content}"</p>
                          </div>
                          <div className="mt-3 flex items-center text-xs text-neutral-500">
                            <span className="font-medium text-primary-700">Anonymous</span>
                            <span className="mx-2">•</span>
                            <span>{getRelativeTimeString(new Date(perspective.createdAt))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 italic">
                    No perspectives have been shared yet. Be the first to contribute!
                  </p>
                )}
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Step.Submission)}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 flex items-center px-5 py-2"
                  size="lg"
                >
                  <span className="material-icons mr-2">add_comment</span>
                  Add Another Perspective
                </Button>
                <Button 
                  onClick={() => navigateToScenario('next')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all px-5 py-2 flex items-center"
                  size="lg"
                >
                  <span className="mr-2">Next Scenario</span>
                  <span className="material-icons">arrow_forward</span>
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
