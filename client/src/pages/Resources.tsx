import { Card, CardContent } from "@/components/ui/card";

const Resources = () => {
  const resourceCategories = [
    {
      title: "AI Ethics Frameworks",
      resources: [
        {
          title: "UNESCO Recommendation on the Ethics of AI",
          source: "UNESCO",
          description: "The first global standard-setting instrument on the ethics of artificial intelligence.",
          link: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
          icon: "public"
        },
        {
          title: "AI Ethics Guidelines Global Inventory",
          source: "AlgorithmWatch",
          description: "A comprehensive database of AI ethics guidelines from around the world.",
          link: "https://algorithmwatch.org/en/ai-ethics-guidelines-global-inventory/",
          icon: "inventory_2"
        },
        {
          title: "Ethics Guidelines for Trustworthy AI",
          source: "European Commission",
          description: "Guidelines for developing and using AI systems in a way that is legal, ethical, and robust.",
          link: "https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai",
          icon: "gavel"
        }
      ]
    },
    {
      title: "AI in Education Resources",
      resources: [
        {
          title: "Artificial Intelligence in Education: Challenges and Opportunities",
          source: "ISTE",
          description: "Research and guidelines for educators on implementing AI in educational settings.",
          link: "https://www.iste.org/areas-of-focus/AI-in-education",
          icon: "school"
        },
        {
          title: "AI4K12",
          source: "CSTA & AAAI",
          description: "Resources for teaching AI concepts in K-12 education.",
          link: "https://ai4k12.org/",
          icon: "smart_toy"
        },
        {
          title: "Elements of AI",
          source: "University of Helsinki",
          description: "Free online course covering the basics of AI for everyone.",
          link: "https://www.elementsofai.com/",
          icon: "menu_book"
        }
      ]
    },
    {
      title: "Digital Inclusion & Equity",
      resources: [
        {
          title: "AI and Inclusion",
          source: "Berkman Klein Center",
          description: "Research network examining the impact of AI on marginalized populations.",
          link: "https://cyber.harvard.edu/projects/ai-inclusion",
          icon: "diversity_3"
        },
        {
          title: "Algorithmic Justice League",
          source: "AJL",
          description: "Organization working to highlight and address bias in AI systems.",
          link: "https://www.ajl.org/",
          icon: "balance"
        },
        {
          title: "Digital Equity in Education",
          source: "ISTE",
          description: "Resources for addressing digital equity challenges in educational settings.",
          link: "https://www.iste.org/areas-of-focus/digital-equity",
          icon: "laptop_chromebook"
        }
      ]
    },
    {
      title: "Sustainable Development Goals",
      resources: [
        {
          title: "SDG 4: Quality Education",
          source: "United Nations",
          description: "Overview, targets, and progress on ensuring inclusive and equitable quality education.",
          link: "https://sdgs.un.org/goals/goal4",
          icon: "school"
        },
        {
          title: "SDG 10: Reduced Inequalities",
          source: "United Nations",
          description: "Overview, targets, and progress on reducing inequality within and among countries.",
          link: "https://sdgs.un.org/goals/goal10",
          icon: "diversity_3"
        },
        {
          title: "AI for Good",
          source: "UN ITU",
          description: "Platform for dialogue on beneficial AI to advance the SDGs.",
          link: "https://aiforgood.itu.int/",
          icon: "public"
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Learning Resources</h1>
      <p className="text-lg text-neutral-700 mb-10 max-w-4xl">
        Explore these resources to deepen your understanding of AI ethics, digital inclusion, 
        and responsible use of technology in educational contexts. These materials complement 
        the scenarios in AI Ethical Compass and provide further background on important concepts.
      </p>
      
      <div className="space-y-12">
        {resourceCategories.map((category, idx) => (
          <div key={idx}>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6 border-b pb-2">
              {category.title}
            </h2>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {category.resources.map((resource, resourceIdx) => (
                <Card key={resourceIdx} className="h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start mb-4">
                      <div className="bg-primary-100 p-2 rounded-full mr-4">
                        <span className="material-icons text-primary-600">{resource.icon}</span>
                      </div>
                      <h3 className="text-lg font-medium text-neutral-900">{resource.title}</h3>
                    </div>
                    
                    <p className="text-neutral-700 mb-2 text-sm flex-grow">
                      {resource.description}
                    </p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-neutral-500">{resource.source}</span>
                      <a 
                        href={resource.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center"
                      >
                        Visit resource
                        <span className="material-icons ml-1 text-sm">open_in_new</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-primary-50 border border-primary-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
          <span className="material-icons mr-2 text-primary-600">tips_and_updates</span>
          Educator Resources
        </h2>
        <p className="text-primary-800 mb-4">
          Are you an educator looking to incorporate AI ethics into your curriculum? 
          These scenarios can be used as classroom discussion starters or as individual assignments.
        </p>
        <ul className="list-disc pl-5 text-primary-700 space-y-2">
          <li>
            Have students complete scenarios independently, then compare and discuss their ethical evaluations in small groups.
          </li>
          <li>
            Use the scenarios as case studies for debates on AI policy in educational settings.
          </li>
          <li>
            Ask students to create their own AI ethics scenarios based on their experiences or research.
          </li>
          <li>
            Connect scenario discussions to broader conversations about digital citizenship and responsible technology use.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Resources;
