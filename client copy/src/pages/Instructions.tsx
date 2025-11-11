import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Instructions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">How to Use AI Ethical Compass</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Getting Started</h2>
          <p className="text-neutral-700 mb-4">
            AI Ethical Compass presents you with real-world scenarios involving AI use in educational contexts. 
            Each scenario is designed to prompt critical thinking about ethical implications, benefits, risks, 
            and considerations for responsible use.
          </p>
          <p className="text-neutral-700">
            There are no "right" or "wrong" answers to these ethical dilemmas. The goal is to develop your critical 
            thinking skills and consider multiple perspectives on complex issues.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">The Four-Step Process</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-neutral-900 mb-1">Identify AI Use</h3>
                <p className="text-neutral-700">
                  For each scenario, you'll first identify if and how AI might be used. This helps build your ability 
                  to recognize AI applications in real-world contexts.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-neutral-900 mb-1">Evaluate Ethics</h3>
                <p className="text-neutral-700">
                  You'll then be guided through a series of questions to evaluate the ethical implications:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-700">
                  <li>Was the AI use appropriate in this context? Why or why not?</li>
                  <li>What potential benefits exist from this use of AI?</li>
                  <li>What are the potential risks or drawbacks?</li>
                  <li>How does this relate to digital inclusion or exclusion?</li>
                  <li>What would constitute responsible use in this scenario?</li>
                </ul>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-neutral-900 mb-1">Share Your Perspective</h3>
                <p className="text-neutral-700">
                  After completing your evaluation, you'll have the opportunity to submit your overall perspective 
                  on the ethical dilemma. All submissions are anonymous to encourage open and honest reflection.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-neutral-900 mb-1">Explore Community Perspectives</h3>
                <p className="text-neutral-700">
                  Finally, you'll see perspectives shared by others who have analyzed the same scenario. This provides 
                  an opportunity to consider viewpoints you might not have thought of and broadens your understanding 
                  of the ethical dimensions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Tips for Meaningful Engagement</h2>
          
          <ul className="space-y-4">
            <li className="flex">
              <span className="material-icons text-primary-600 mr-2 flex-shrink-0">lightbulb</span>
              <span className="text-neutral-700">
                <strong>Consider multiple stakeholders:</strong> Think about how the AI use affects different groups, 
                including students, teachers, parents, administrators, and society as a whole.
              </span>
            </li>
            
            <li className="flex">
              <span className="material-icons text-primary-600 mr-2 flex-shrink-0">lightbulb</span>
              <span className="text-neutral-700">
                <strong>Look for nuance:</strong> Most ethical questions don't have simple answers. Try to identify the 
                tensions and trade-offs involved in each scenario.
              </span>
            </li>
            
            <li className="flex">
              <span className="material-icons text-primary-600 mr-2 flex-shrink-0">lightbulb</span>
              <span className="text-neutral-700">
                <strong>Connect to broader principles:</strong> Consider how each scenario relates to core ethical principles 
                like fairness, transparency, privacy, autonomy, and accessibility.
              </span>
            </li>
            
            <li className="flex">
              <span className="material-icons text-primary-600 mr-2 flex-shrink-0">lightbulb</span>
              <span className="text-neutral-700">
                <strong>Be specific in your responses:</strong> Rather than general statements, provide concrete reasoning and 
                examples in your evaluations.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button asChild>
          <Link to="/scenarios">Start Exploring Scenarios</Link>
        </Button>
      </div>
    </div>
  );
};

export default Instructions;
