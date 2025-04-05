import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface SdgDetail {
  goal: string;
  description: string;
  relevance: string;
  icon: string;
}

interface SdgDetailsProps {
  sdgDetails: SdgDetail[];
  className?: string;
}

const SdgDetails = ({ sdgDetails, className = "" }: SdgDetailsProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemToggle = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (!sdgDetails || sdgDetails.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white rounded-lg border border-green-200 overflow-hidden", className)}>
      <div className="bg-gradient-to-r from-green-100 to-blue-50 p-4 border-b border-green-200">
        <h3 className="text-lg font-medium text-green-800 flex items-center">
          <span className="material-icons text-green-700 mr-2">public</span>
          UN Sustainable Development Goals
          <span className="ml-2 text-sm text-green-600 font-normal">
            (Relevant to this scenario)
          </span>
        </h3>
      </div>
      
      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="divide-y divide-neutral-100"
      >
        {sdgDetails.map((detail, index) => (
          <AccordionItem 
            key={index} 
            value={`sdg-${index}`}
            className="border-b-0 last:border-0"
          >
            <AccordionTrigger 
              onClick={() => handleItemToggle(`sdg-${index}`)}
              className="py-4 px-5 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center text-left">
                <div className="w-12 h-12 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="material-icons text-green-700">
                    {detail.icon || "eco"}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-green-800">{detail.goal}</h4>
                  <p className="text-sm text-neutral-600 truncate max-w-md">
                    {detail.description.substring(0, 60)}...
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 py-4 bg-green-50 border-t border-green-100">
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-green-800">Goal Description</h5>
                  <p className="text-neutral-700">{detail.description}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-green-800">Relevance to This Scenario</h5>
                  <p className="text-neutral-700">{detail.relevance}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SdgDetails;