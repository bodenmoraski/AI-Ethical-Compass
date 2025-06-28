import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../lib/auth';
import PerspectiveCard from './PerspectiveCard';
import SdgDetails from './SdgDetails';
import RelatedResources from './RelatedResources';
import { type Scenario, type Perspective } from '@shared/schema';
import { submitPerspective, updateProgress } from '../lib/scenarios';

// Helper to normalize SDG numbers from various formats
const getNormalizedSdgNumber = (tag: string): string => {
  // Extract number from formats like "SDG 4", "Quality Education (SDG 4)", "4", etc.
  const match = tag.match(/(\d+)/);
  return match ? match[1] : tag;
};

// Helper to get scenario-specific relevance
const getRelevance = (sdgNumber: string, scenarioTitle: string) => {
  const relevanceMap: Record<string, Record<string, string>> = {
    "4": {
      "AI-Generated Essay": "This scenario directly impacts educational integrity and learning outcomes, particularly for students from diverse backgrounds. It raises questions about the role of AI in academic work and its effects on genuine learning and skill development.",
      "Facial Recognition": "This scenario examines how surveillance technologies in educational settings affect student privacy and learning environment, potentially impacting educational access and quality.",
      "AI Content Moderation": "This scenario explores how AI moderation affects academic discourse and educational content accessibility, potentially influencing the quality and inclusivity of education.",
      "AI in College Admissions": "This scenario directly relates to educational access and equity in higher education, examining how AI-driven decisions impact educational opportunities.",
      "Accessibility AI Tools": "This scenario focuses on how AI can enhance educational accessibility while maintaining academic standards and ensuring quality learning experiences.",
      "AI-Powered Tutoring": "This scenario examines how AI tutoring systems can provide personalized education while ensuring quality learning outcomes for all students.",
      "default": "This scenario examines how AI technologies impact educational quality, access, and equity in learning environments."
    },
    "10": {
      "AI-Generated Essay": "This scenario highlights potential inequalities in access to AI tools and their impact on academic performance, particularly affecting students from different socioeconomic backgrounds.",
      "Facial Recognition": "This scenario raises concerns about bias in surveillance systems and their disproportionate impact on different student populations.",
      "AI Content Moderation": "This scenario examines how automated content moderation might affect diverse voices and perspectives in educational discourse.",
      "AI in College Admissions": "This scenario directly addresses equality in educational opportunities and the potential for AI to either reduce or amplify existing inequalities in college admissions.",
      "Accessibility AI Tools": "This scenario explores how AI tools can help reduce educational inequalities while ensuring fair access to learning resources.",
      "AI-Powered Tutoring": "This scenario examines how AI tutoring can democratize access to personalized education while addressing potential disparities.",
      "default": "This scenario examines how AI implementation might affect equality and fairness in educational settings."
    },
    "16": {
      "default": "This scenario examines how AI implementation affects institutional integrity, transparency, and justice in educational settings."
    },
    "9": {
      "default": "This scenario explores how AI innovation in education can be balanced with responsible development and inclusive access."
    }
  };

  return relevanceMap[sdgNumber]?.[scenarioTitle] || relevanceMap[sdgNumber].default;
};

// Transform the raw data to match the Scenario type
const transformScenarios = (data: any[]): Scenario[] => {
  console.log("Raw scenarios data:", data);
  const transformed = data.map(scenario => {
    const sdgDetails = scenario.sdgTags.map((tag: string) => {
      const normalizedTag = getNormalizedSdgNumber(tag);
      const sdgDescriptions: Record<string, { goal: string; description: string; icon: string }> = {
        "1": {
          goal: "No Poverty (SDG 1)",
          description: "End poverty in all its forms everywhere and ensure access to resources and opportunities.",
          icon: "attach_money"
        },
        "3": {
          goal: "Good Health and Well-being (SDG 3)",
          description: "Ensure healthy lives and promote well-being for all at all ages.",
          icon: "favorite"
        },
        "4": {
          goal: "Quality Education (SDG 4)",
          description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
          icon: "school"
        },
        "5": {
          goal: "Gender Equality (SDG 5)",
          description: "Achieve gender equality and empower all women and girls.",
          icon: "diversity_3"
        },
        "8": {
          goal: "Decent Work and Economic Growth (SDG 8)",
          description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.",
          icon: "work"
        },
        "9": {
          goal: "Industry, Innovation and Infrastructure (SDG 9)",
          description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
          icon: "precision_manufacturing"
        },
        "10": {
          goal: "Reduced Inequalities (SDG 10)",
          description: "Reduce inequality within and among countries and ensure equal opportunities for all.",
          icon: "balance"
        },
        "11": {
          goal: "Sustainable Cities and Communities (SDG 11)",
          description: "Make cities and human settlements inclusive, safe, resilient and sustainable.",
          icon: "location_city"
        },
        "13": {
          goal: "Climate Action (SDG 13)",
          description: "Take urgent action to combat climate change and its impacts.",
          icon: "eco"
        },
        "16": {
          goal: "Peace, Justice and Strong Institutions (SDG 16)",
          description: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels.",
          icon: "gavel"
        }
      };

      const description = sdgDescriptions[normalizedTag];
      if (!description) return null;

      return {
        goal: description.goal,
        description: description.description,
        relevance: getRelevance(normalizedTag, scenario.title),
        icon: description.icon
      };
    }).filter(Boolean);

    return {
      ...scenario,
      options: scenario.options.map((opt: any) => opt.text),
      aiUseAnswer: scenario.description,
      sdgDetails,
      relatedResources: scenario.resources.map((res: any) => ({
        title: res.title,
        source: res.type,
        type: res.type,
        link: res.url
      })),
      order: scenario.id
    };
  });
  console.log("Transformed scenarios:", transformed);
  return transformed;
};

const ScenarioView = () => {
  const params = useParams();
  const scenarioId = params.id ? parseInt(params.id) : null;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState(1);
  const [perspectiveContent, setPerspectiveContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('quality');

  // Fetch scenarios
  const { data: scenarios = [] } = useQuery<Scenario[]>({
    queryKey: ["scenarios"],
    queryFn: async () => {
      const response = await fetch('/api/scenarios');
      if (!response.ok) {
        throw new Error('Failed to fetch scenarios');
      }
      const data = await response.json();
      return transformScenarios(data);
    },
  });

  // Get current scenario
  const currentScenario = scenarios.find(s => s.id === scenarioId);

  // Fetch perspectives for current scenario
  const { data: perspectivesData, isLoading, error } = useQuery({
    queryKey: ["/api/perspective-rankings", scenarioId, sortBy],
    queryFn: async () => {
      if (!scenarioId) return { perspectives: [], pagination: {}, ranking: {}, metadata: {} };
      const response = await fetch(`/api/perspective-rankings?scenarioId=${scenarioId}&rankBy=${sortBy}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch perspectives');
      return await response.json();
    },
    enabled: !!scenarioId && activeTab === 4,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Submit perspective mutation
  const submitMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!scenarioId) throw new Error('No scenario selected');
      return await submitPerspective(
        scenarioId,
        content,
        user?.email?.split('@')[0] || 'Anonymous User',
        user?.id,
        user?.email
      );
    },
    onSuccess: async (newPerspective) => {
      setPerspectiveContent('');
      setIsSubmitting(false);
      
      // Update progress
      if (scenarioId) {
        await updateProgress(scenarioId, true);
      }
      
      // Invalidate and refetch perspectives
      await queryClient.invalidateQueries({ queryKey: ["/api/perspective-rankings", scenarioId] });
      await queryClient.refetchQueries({ queryKey: ["/api/perspective-rankings", scenarioId, sortBy] });
      
      toast({
        title: "Perspective submitted!",
        description: "Your perspective has been added to the community discussion.",
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      let errorMessage = "There was an error submitting your perspective. Please try again.";
      
      if (error.message.includes("400:")) {
        try {
          const errorData = error.message.split("400: ")[1];
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
        } catch {
          // If parsing fails, use default message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmitPerspective = async () => {
    if (!perspectiveContent.trim()) {
      toast({
        title: "Empty perspective",
        description: "Please enter your perspective before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate(perspectiveContent);
  };

  if (!currentScenario) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-icons text-4xl text-neutral-400">search</span>
          <h2 className="text-xl font-semibold text-neutral-900">Scenario Not Found</h2>
          <p className="text-neutral-600">The requested scenario could not be found.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Scenario {currentScenario.order}</Badge>
                <Badge variant="secondary">AI Ethics</Badge>
              </div>
              <CardTitle className="text-2xl mb-3">{currentScenario.title}</CardTitle>
              <p className="text-neutral-600 leading-relaxed">{currentScenario.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1">Identify AI Use</TabsTrigger>
          <TabsTrigger value="2">Evaluate Ethics</TabsTrigger>
          <TabsTrigger value="3">Share Perspective</TabsTrigger>
          <TabsTrigger value="4">Explore Community</TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">search</span>
                Step 1: Identify AI Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">
                First, let's identify if and how AI might be used in this scenario. Consider the technology, 
                the context, and the potential AI applications.
              </p>
              
              <div className="space-y-3">
                {currentScenario.options.map((option: string, index: number) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-neutral-50 transition-colors">
                    <p className="font-medium">{option}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI Use Analysis</h4>
                <p className="text-blue-800">{currentScenario.aiUseAnswer}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">balance</span>
                Step 2: Evaluate Ethics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">
                Now let's evaluate the ethical implications of AI use in this scenario. Consider the benefits, 
                risks, and responsible use practices.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-700">Potential Benefits</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-green-600 text-sm mt-0.5">check_circle</span>
                      <span>Improved efficiency and accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-green-600 text-sm mt-0.5">check_circle</span>
                      <span>Enhanced accessibility and inclusion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-green-600 text-sm mt-0.5">check_circle</span>
                      <span>Personalized learning experiences</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-700">Potential Risks</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-red-600 text-sm mt-0.5">warning</span>
                      <span>Privacy and data security concerns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-red-600 text-sm mt-0.5">warning</span>
                      <span>Algorithmic bias and discrimination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-red-600 text-sm mt-0.5">warning</span>
                      <span>Reduced human interaction and oversight</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">edit</span>
                Step 3: Share Your Perspective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">
                Share your thoughts on the ethical implications of this scenario. Consider the stakeholders, 
                the trade-offs, and what responsible AI use might look like.
              </p>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your perspective on the ethical implications of this scenario..."
                  value={perspectiveContent}
                  onChange={(e) => setPerspectiveContent(e.target.value)}
                  className="min-h-32"
                  maxLength={2000}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {perspectiveContent.length}/2000 characters
                  </span>
                  
                  <Button 
                    onClick={handleSubmitPerspective}
                    disabled={isSubmitting || !perspectiveContent.trim()}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="material-icons">send</span>
                        Submit Perspective
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="4" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="material-icons">forum</span>
                  Step 4: Explore Community Perspectives
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="quality">Quality</option>
                    <option value="recent">Recent</option>
                    <option value="likes">Most Liked</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-neutral-600">Loading perspectives...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <span className="material-icons text-4xl text-red-400 mb-4">error_outline</span>
                  <p className="text-neutral-600">Failed to load perspectives. Please try again.</p>
                </div>
              ) : perspectivesData?.perspectives?.length > 0 ? (
                <div className="space-y-4">
                  {perspectivesData.perspectives.map((perspective: Perspective) => (
                    <PerspectiveCard
                      key={perspective.id}
                      perspective={perspective}
                      scenarioId={scenarioId!}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-icons text-4xl text-neutral-400 mb-4">forum</span>
                  <p className="text-neutral-600">No perspectives yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SDG Details */}
      {currentScenario.sdgDetails && currentScenario.sdgDetails.length > 0 && (
        <SdgDetails sdgDetails={currentScenario.sdgDetails} />
      )}

      {/* Related Resources */}
      {currentScenario.relatedResources && currentScenario.relatedResources.length > 0 && (
        <RelatedResources resources={currentScenario.relatedResources} />
      )}
    </div>
  );
};

export default ScenarioView;
