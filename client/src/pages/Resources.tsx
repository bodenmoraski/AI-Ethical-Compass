import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const resources = [
    {
      title: "UNESCO AI Ethics Guidelines",
      description: "The first global standard-setting instrument on the ethics of artificial intelligence, providing comprehensive frameworks for educational implementation.",
      icon: "policy",
      category: "Guidelines",
      link: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics"
    },
    {
      title: "AI4K12 Guidelines",
      description: "Comprehensive guidelines for teaching AI concepts in K-12 education, developed by CSTA & AAAI.",
      icon: "school",
      category: "Guidelines",
      link: "https://ai4k12.org/"
    },
    {
      title: "ISTE AI in Education Research",
      description: "Latest research and guidelines for educators on implementing AI in educational settings responsibly.",
      icon: "science",
      category: "Research",
      link: "https://www.iste.org/areas-of-focus/AI-in-education"
    },
    {
      title: "Elements of AI Course",
      description: "Free online course covering AI basics and ethics, perfect for educators and students.",
      icon: "school",
      category: "Courses",
      link: "https://www.elementsofai.com/"
    },
    {
      title: "AI Fairness 360 Toolkit",
      description: "Open-source toolkit to help detect and mitigate discriminatory biases in AI systems.",
      icon: "balance",
      category: "Tools",
      link: "https://github.com/Trusted-AI/AIF360"
    },
    {
      title: "Algorithmic Justice League",
      description: "Tools and resources for identifying and addressing algorithmic bias in AI systems.",
      icon: "gavel",
      category: "Tools",
      link: "https://www.ajl.org/"
    },
    {
      title: "Digital Equity in Education",
      description: "Resources for addressing digital equity challenges in AI-enhanced educational settings.",
      icon: "laptop",
      category: "Guidelines",
      link: "https://www.iste.org/areas-of-focus/digital-equity"
    },
    {
      title: "EU Ethics Guidelines for Trustworthy AI",
      description: "European Union's guidelines for achieving trustworthy artificial intelligence.",
      icon: "policy",
      category: "Guidelines",
      link: "https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai"
    }
  ];

  const categories = ["All", "Guidelines", "Research", "Tools", "Examples"];

  const filteredResources = selectedCategory === "All" 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Educational{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-800">
                  AI Resources
                </span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-primary-100"></span>
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Explore our curated collection of resources on ethical AI implementation in education, 
              from comprehensive guidelines to practical tools and real-world case studies.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "border-2 border-primary-300 bg-primary-50 text-slate-800 font-medium"
                    : "border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-primary-300 font-medium"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="relative bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredResources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 hover:border-primary-200 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <div className="flex items-start mb-6">
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mr-4 group-hover:border-primary-200 transition-colors">
                      <span className="material-icons text-2xl text-primary-800">
                        {resource.icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-primary-800 uppercase tracking-wider mb-1 font-medium">
                        {resource.category}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-primary-800 transition-colors">
                        {resource.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {resource.description}
                  </p>
                  <div className="mt-6 flex items-center text-primary-800 font-medium">
                    <span className="text-base">Learn More</span>
                    <span className="material-icons ml-2 text-xl group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Educator Resources CTA */}
      <div className="relative bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-start space-x-6">
              <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <span className="material-icons text-2xl text-primary-800">school</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">For Educators</h2>
                <p className="text-slate-600 mb-6">
                  Looking to incorporate AI ethics into your curriculum? These resources can help you create 
                  engaging lessons and foster meaningful discussions about AI's role in education.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-2 flex items-center">
                      <span className="material-icons text-xl text-primary-800 mr-2">format_quote</span>
                      Discussion Prompts
                    </h3>
                    <p className="text-slate-600">
                      Use our scenarios as starting points for classroom discussions about AI ethics.
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-2 flex items-center">
                      <span className="material-icons text-xl text-primary-800 mr-2">assignment</span>
                      Activity Ideas
                    </h3>
                    <p className="text-slate-600">
                      Engage students with hands-on activities exploring AI's impact on education.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
