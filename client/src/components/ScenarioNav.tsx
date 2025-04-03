import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import type { Scenario } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScenarioNavProps {
  className?: string;
}

const ScenarioNav = ({ className = "" }: ScenarioNavProps) => {
  const params = useParams();
  const currentScenarioId = params.id ? parseInt(params.id) : null;
  
  const { data: scenarios = [] } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });

  // Simple progress tracking, will be replaced with actual progress data
  const completedScenarios = 1;
  const progressPercentage = scenarios.length > 0 
    ? Math.round((completedScenarios / scenarios.length) * 100) 
    : 0;

  return (
    <nav className={`lg:w-64 flex-shrink-0 ${className}`} aria-label="Scenarios">
      <Card>
        <CardHeader className="p-4 bg-primary-600 text-white">
          <h2 className="text-lg font-semibold">Scenarios</h2>
        </CardHeader>
        <div className="divide-y divide-neutral-200">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              to={`/scenarios/${scenario.id}`}
              className={`block px-4 py-3 ${
                currentScenarioId === scenario.id
                  ? "bg-primary-50 hover:bg-primary-100 text-primary-700 border-l-4 border-primary-600"
                  : "hover:bg-neutral-50 text-neutral-700 border-l-4 border-transparent hover:border-neutral-300"
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              aria-current={currentScenarioId === scenario.id ? "page" : undefined}
            >
              <span className="font-medium">{scenario.order}. {scenario.title}</span>
            </Link>
          ))}
        </div>
      </Card>
      
      <Card className="mt-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Your Progress</h2>
          <Progress value={progressPercentage} aria-label={`${progressPercentage}% complete`} />
          <p className="text-sm text-neutral-500 mt-2">
            {completedScenarios} of {scenarios.length} scenarios completed
          </p>
        </CardContent>
      </Card>
    </nav>
  );
};

export default ScenarioNav;
