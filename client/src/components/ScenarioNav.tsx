import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import type { Scenario } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
    <nav className={`lg:w-72 flex-shrink-0 ${className}`} aria-label="Scenarios">
      <Card className="shadow-lg">
        <CardHeader className="p-6 bg-white rounded-t-lg border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <span className="material-icons text-2xl text-primary-600">menu_book</span>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">AI Ethics Scenarios</h2>
              <p className="text-sm text-neutral-600 mt-1">Explore ethical dilemmas in AI use</p>
            </div>
          </div>
        </CardHeader>
        <div className="divide-y divide-neutral-100">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              to={`/scenarios/${scenario.id}`}
              className={`block px-6 py-4 transition-all duration-200 ${
                currentScenarioId === scenario.id
                  ? "bg-primary-50 hover:bg-primary-100 text-primary-900 border-l-4 border-primary-600"
                  : "hover:bg-neutral-50 text-neutral-700 border-l-4 border-transparent hover:border-neutral-300"
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              aria-current={currentScenarioId === scenario.id ? "page" : undefined}
            >
              <div className="flex items-start gap-3">
                <Badge 
                  variant={currentScenarioId === scenario.id ? "default" : "outline"}
                  className="mt-1"
                >
                  {scenario.order}
                </Badge>
                <span className="font-medium">{scenario.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
      
      <Card className="mt-6 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-icons text-primary-600">trending_up</span>
            <h2 className="text-lg font-semibold text-neutral-900">Your Progress</h2>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-neutral-100" 
            aria-label={`${progressPercentage}% complete`} 
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-neutral-600">
              {completedScenarios} of {scenarios.length} completed
            </p>
            <span className="text-sm font-medium text-primary-600">
              {progressPercentage}%
            </span>
          </div>
        </CardContent>
      </Card>
    </nav>
  );
};

export default ScenarioNav;
