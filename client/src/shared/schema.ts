export type Scenario = {
  id: number;
  title: string;
  description: string;
  options: string[];
  aiUseAnswer: string;
  sdgTags: string[];
  sdgDetails: {
    goal: string;
    description: string;
    relevance: string;
    icon: string;
  }[];
  relatedResources: {
    title: string;
    url: string;
    type: string;
  }[];
  order: number;
  completed: boolean;
}; 