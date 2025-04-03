import { Card, CardContent } from "@/components/ui/card";

interface Resource {
  title: string;
  source: string;
  type: string;
  link: string;
}

interface RelatedResourcesProps {
  resources: Resource[];
}

const getIconForResourceType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'video':
      return 'play_circle';
    case 'research':
      return 'science';
    case 'guide':
      return 'menu_book';
    case 'whitepaper':
      return 'description';
    default:
      return 'article';
  }
};

const RelatedResources = ({ resources }: RelatedResourcesProps) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-5 sm:p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Related Resources</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {resources.map((resource, index) => (
            <a 
              key={index} 
              href={resource.link} 
              className="group block rounded-lg p-4 border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="material-icons text-neutral-400 group-hover:text-primary-600">
                    {getIconForResourceType(resource.type)}
                  </span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-900 group-hover:text-primary-700">
                    {resource.title}
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500">{resource.source}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedResources;
