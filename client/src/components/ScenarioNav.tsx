import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { type Scenario } from '@shared/schema';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import scenariosData from '../../../shared/scenarios.json';

// Utility to normalize SDG tag to a number
const getNormalizedSdgNumber = (tag: string): string => {
  // Extract number from various SDG formats (e.g., "SDG4", "4", "Goal 4")
  const match = tag.match(/\d+/);
  return match ? match[0] : tag;
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
    },
    "11": {
      "default": "This scenario examines how AI technologies impact sustainable communities and urban development in educational contexts."
    },
    "5": {
      "default": "This scenario explores how AI implementation affects gender equality and empowerment in educational settings."
    },
    "1": {
      "default": "This scenario examines how AI technologies impact poverty reduction and access to educational resources."
    },
    "3": {
      "default": "This scenario explores how AI implementation affects health and well-being in educational environments."
    },
    "8": {
      "default": "This scenario examines how AI technologies impact economic growth and decent work opportunities in education."
    },
    "13": {
      "default": "This scenario explores how AI implementation relates to climate action and environmental sustainability in education."
    }
  };

  // Safely access the relevance map with fallback
  const sdgMap = relevanceMap[sdgNumber];
  if (!sdgMap) {
    return `This scenario examines how AI implementation relates to SDG ${sdgNumber} principles in educational contexts.`;
  }
  
  return sdgMap[scenarioTitle] || sdgMap.default;
};

// Transform the raw data to match the Scenario type
const transformScenarios = (data: any[]): Scenario[] => {
  console.log("Raw scenarios data:", data);
  
  if (!Array.isArray(data)) {
    console.warn("Data is not an array:", data);
    return [];
  }
  
  const transformed = data.map((scenario: any) => {
    // Ensure scenario has required properties with fallbacks
    const sdgTags = scenario.sdgTags || scenario.sdg_tags || [];
    const options = scenario.options || [];
    const resources = scenario.resources || scenario.relatedResources || [];
    
    const sdgDetails = (Array.isArray(sdgTags) ? sdgTags : []).map((tag: string) => {
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
        relevance: getRelevance(normalizedTag, scenario.title || ''),
        icon: description.icon
      };
    }).filter(Boolean);

    return {
      ...scenario,
      options: (Array.isArray(options) ? options : []).map((opt: any) => 
        typeof opt === 'string' ? opt : opt?.text || opt
      ),
      aiUseAnswer: scenario.description || scenario.aiUseAnswer || '',
      sdgDetails,
      relatedResources: (Array.isArray(resources) ? resources : []).map((res: any) => ({
        title: res.title || res.name || 'Resource',
        source: res.type || res.source || 'Unknown',
        type: res.type || res.source || 'link',
        link: res.url || res.link || '#'
      })),
      order: scenario.id || scenario.order || 0
    };
  });
  
  console.log("Transformed scenarios:", transformed);
  return transformed;
};

interface ScenarioNavProps {
  className?: string;
}

const ScenarioNav: React.FC<ScenarioNavProps> = ({ className }) => {
  const params = useParams();
  const currentScenarioId = params.id ? parseInt(params.id) : null;

  // Use static scenarios data with memoization
  const scenarios = useMemo(() => {
    console.log("ScenarioNav: Processing scenarios data", scenariosData);
    const result = transformScenarios(scenariosData);
    console.log("ScenarioNav: Transformed scenarios result", result);
    return result;
  }, []);

  console.log("ScenarioNav: Final scenarios for rendering", scenarios);

  // Simple progress tracking, will be replaced with actual progress data
  const completedScenarios = 1;
  const progressPercentage = scenarios.length > 0 
    ? Math.round((completedScenarios / scenarios.length) * 100) 
    : 0;

  return (
    <nav className={cn("w-full bg-white rounded-lg shadow-sm border", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Scenarios</h2>
        <p className="text-sm text-gray-600 mt-1">
          {scenarios.length} ethical dilemmas to explore
        </p>
      </div>
      
      <div className="max-h-96 lg:max-h-[500px] overflow-y-auto">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            to={`/scenarios/${scenario.id}`}
            className={cn(
              "block p-4 border-b last:border-b-0 transition-colors",
              currentScenarioId === scenario.id
                ? "bg-blue-50 border-l-4 border-l-blue-500"
                : "hover:bg-gray-50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {scenario.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {scenario.description?.substring(0, 100)}...
                </p>
                
                {/* SDG Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {scenario.sdgDetails?.slice(0, 2).map((sdg: any, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <span className="material-icons text-xs mr-1">
                        {sdg.icon}
                      </span>
                      SDG {sdg.goal.match(/\d+/)?.[0]}
                    </span>
                  ))}
                  {scenario.sdgDetails && scenario.sdgDetails.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{scenario.sdgDetails.length - 2}
                    </span>
                  )}
                </div>
              </div>
              
              {currentScenarioId === scenario.id && (
                <div className="ml-2 flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {/* Progress Card */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-icons text-blue-600 text-sm">trending_up</span>
          <h3 className="text-sm font-semibold text-gray-900">Your Progress</h3>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-gray-200" 
          aria-label={`${progressPercentage}% complete`} 
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-600">
            {completedScenarios} of {scenarios.length} completed
          </p>
          <span className="text-xs font-medium text-blue-600">
            {progressPercentage}%
          </span>
        </div>
      </div>
    </nav>
  );
};

export default ScenarioNav;
