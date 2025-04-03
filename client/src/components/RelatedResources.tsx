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

// Get appropriate icon for each resource type
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
    case 'article':
      return 'article';
    case 'tool':
      return 'handyman';
    case 'website':
      return 'language';
    case 'podcast':
      return 'podcast';
    default:
      return 'link';
  }
};

// Get color theme for each resource type
const getColorForResourceType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'video':
      return 'text-red-500 bg-red-50 border-red-100';
    case 'research':
      return 'text-blue-500 bg-blue-50 border-blue-100';
    case 'guide':
      return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    case 'whitepaper':
      return 'text-purple-500 bg-purple-50 border-purple-100';
    case 'article':
      return 'text-amber-500 bg-amber-50 border-amber-100';
    case 'tool':
      return 'text-indigo-500 bg-indigo-50 border-indigo-100';
    case 'website':
      return 'text-cyan-500 bg-cyan-50 border-cyan-100';
    case 'podcast':
      return 'text-pink-500 bg-pink-50 border-pink-100';
    default:
      return 'text-neutral-500 bg-neutral-50 border-neutral-100';
  }
};

const RelatedResources = ({ resources }: RelatedResourcesProps) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8 shadow-md border-0 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="material-icons mr-2">menu_book</span>
          Related Resources
        </h3>
        <p className="text-blue-100 text-sm mt-1">Expand your understanding with these curated resources</p>
      </div>
      <CardContent className="p-5 sm:p-6 bg-white">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {resources.map((resource, index) => {
            const colorClass = getColorForResourceType(resource.type);
            return (
              <a 
                key={index} 
                href={resource.link} 
                className="group flex rounded-lg p-3 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center mr-3`}>
                  <span className="material-icons text-lg">
                    {getIconForResourceType(resource.type)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-neutral-900 group-hover:text-primary-700 line-clamp-2">
                      {resource.title}
                    </h4>
                    <span className="material-icons text-neutral-300 group-hover:text-primary-500 ml-2 text-sm">
                      open_in_new
                    </span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className="text-xs uppercase font-medium px-2 py-0.5 rounded-full mr-2 inline-block text-xs border border-neutral-200 bg-neutral-50">
                      {resource.type}
                    </span>
                    <p className="text-xs text-neutral-500">{resource.source}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedResources;
