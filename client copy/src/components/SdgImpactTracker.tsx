import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Scenario } from "@shared/schema";

interface SdgImpactTrackerProps {
  scenarios: Scenario[];
  totalPerspectives: number;
}

const SdgImpactTracker = ({ scenarios, totalPerspectives }: SdgImpactTrackerProps) => {
  // Calculate metrics
  const sdg4Scenarios = scenarios.filter(s => s.sdgTags.includes("4")).length;
  const sdg10Scenarios = scenarios.filter(s => s.sdgTags.includes("10")).length;
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
          Our Collective Impact
        </h2>
        
        <div className="space-y-6">
          {/* SDG 4 Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <span className="material-icons text-primary-600">school</span>
                </div>
                <h3 className="text-lg font-medium text-neutral-900">
                  Quality Education (SDG 4)
                </h3>
              </div>
              <span className="text-sm text-neutral-600">
                {sdg4Scenarios} scenarios
              </span>
            </div>
            <Progress value={(sdg4Scenarios / scenarios.length) * 100} className="h-2" />
            <p className="text-sm text-neutral-600 mt-2">
              Contributing to inclusive and equitable quality education through {totalPerspectives} perspectives
            </p>
          </div>
          
          {/* SDG 10 Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="bg-accent-100 p-2 rounded-full mr-3">
                  <span className="material-icons text-accent-600">diversity_3</span>
                </div>
                <h3 className="text-lg font-medium text-neutral-900">
                  Reduced Inequalities (SDG 10)
                </h3>
              </div>
              <span className="text-sm text-neutral-600">
                {sdg10Scenarios} scenarios
              </span>
            </div>
            <Progress value={(sdg10Scenarios / scenarios.length) * 100} className="h-2" />
            <p className="text-sm text-neutral-600 mt-2">
              Addressing digital inclusion and reducing inequalities through {totalPerspectives} perspectives
            </p>
          </div>
          
          {/* Global Impact */}
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full mr-3">
                <span className="material-icons text-primary-600">public</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900">
                  Global Community Impact
                </h3>
                <p className="text-sm text-neutral-600">
                  Together, we've contributed {totalPerspectives} perspectives to the global conversation about ethical AI use in education
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SdgImpactTracker; 