import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { type Scenario } from "@shared/schema";
import ScenarioNav from "@/components/ScenarioNav";
import ScenarioView from "@/components/ScenarioView";
import { Card } from "@/components/ui/card";
import scenariosData from "../../../shared/scenarios.json";

// Helper to extract SDG number from tag
const getNormalizedSdgNumber = (tag: string): string => {
  // If it's already just a number as string, return it
  if (/^\d+$/.test(tag)) return tag;
  // If it's in the format "Quality Education (SDG 4)", extract the number
  const match = tag.match(/SDG\s*(\d+)/i);
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

const Scenarios = () => {
  const params = useParams();
  const navigate = useNavigate();
  const scenarioId = params.id ? parseInt(params.id) : null;
  
  console.log("Initial scenariosData:", scenariosData);
  
  const { data: scenarios = [], isLoading, error } = useQuery<Scenario[]>({
    queryKey: ["scenarios"],
    queryFn: async () => {
      console.log("Starting to transform scenarios");
      const result = transformScenarios(scenariosData);
      console.log("Transformation complete:", result);
      return result;
    },
  });

  useEffect(() => {
    console.log("Current scenarios:", scenarios);
    console.log("Is loading:", isLoading);
    if (error) console.error("Error:", error);
    
    if (!scenarioId && scenarios.length > 0) {
      navigate(`/scenarios/${scenarios[0].id}`);
    }
  }, [scenarioId, scenarios, navigate, isLoading, error]);

  if (error instanceof Error) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <span className="material-icons text-4xl">error_outline</span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Scenarios</h2>
          <p className="text-neutral-600">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">AI Ethics Scenarios</h1>
        <p className="text-lg text-neutral-600 max-w-3xl">
          Explore these scenarios to develop critical thinking about the ethical, responsible, and inclusive use of AI. 
          Each scenario connects to the UN Sustainable Development Goals 4 (Quality Education) and 10 (Reduced Inequalities).
        </p>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-8">
        <ScenarioNav className="lg:sticky lg:top-8 lg:self-start" />
        
        <div className="flex-1">
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                <p className="text-lg text-neutral-600">Loading scenarios...</p>
              </div>
            </Card>
          ) : scenarios.length > 0 ? (
            <ScenarioView />
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <span className="material-icons text-4xl text-neutral-400">info</span>
                <h2 className="text-xl font-semibold text-neutral-900">No Scenarios Available</h2>
                <p className="text-neutral-600">Please check your server connection and try again.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scenarios;
