import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { type Scenario } from "@shared/schema";
import ScenarioNav from "@/components/ScenarioNav";
import ScenarioView from "@/components/ScenarioView";
import { Card } from "@/components/ui/card";
import scenariosData from "../../../shared/scenarios.json";

// Transform the raw data to match the Scenario type
const transformScenarios = (data: any[]): Scenario[] => {
  console.log("Raw scenarios data:", data);
  const transformed = data.map(scenario => ({
    ...scenario,
    options: scenario.options.map((opt: any) => opt.text),
    aiUseAnswer: scenario.description, // Using description as aiUseAnswer for now
    sdgDetails: scenario.sdgTags.map((tag: string) => ({
      goal: tag,
      description: `Description for ${tag}`,
      relevance: `Relevance for ${tag}`,
      icon: `Icon for ${tag}`
    })),
    relatedResources: scenario.resources.map((res: any) => ({
      title: res.title,
      source: res.type,
      type: res.type,
      link: res.url
    })),
    order: scenario.id // Using id as order for now
  }));
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
