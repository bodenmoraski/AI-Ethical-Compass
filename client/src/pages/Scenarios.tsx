import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { type Scenario } from "@shared/schema";
import ScenarioNav from "@/components/ScenarioNav";
import ScenarioView from "@/components/ScenarioView";

const Scenarios = () => {
  const params = useParams();
  const navigate = useNavigate();
  const scenarioId = params.id ? parseInt(params.id) : null;
  
  const { data: scenarios = [], isLoading, error } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
    queryFn: async () => {
      const response = await fetch("/api/scenarios", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch scenarios");
      }
      return response.json();
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
      <div className="flex-1 flex justify-center items-center h-64">
        <p className="text-red-500">Error loading scenarios: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page title */}
      <div className="border-b border-neutral-200 pb-5 mb-5">
        <h1 className="text-3xl font-bold text-neutral-900">AI Ethics Scenarios</h1>
        <p className="mt-2 text-neutral-600 max-w-4xl">
          Explore these scenarios to develop critical thinking about the ethical, responsible, and inclusive use of AI. 
          Each scenario connects to the UN Sustainable Development Goals 4 (Quality Education) and 10 (Reduced Inequalities).
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <ScenarioNav />
        
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center h-64">
            <p>Loading scenarios...</p>
          </div>
        ) : scenarios.length > 0 ? (
          <ScenarioView />
        ) : (
          <div className="flex-1 flex justify-center items-center h-64">
            <p>No scenarios available. Please check the server connection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scenarios;
