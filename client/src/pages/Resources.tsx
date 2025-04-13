import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const Resources = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Keep the data structure here, but we'll fetch text from translations
  const resourcesData = [
    { key: "unescoGuidelines", icon: "policy", categoryKey: "guidelines" },
    { key: "ai4k12Guidelines", icon: "school", categoryKey: "guidelines" },
    { key: "isteResearch", icon: "science", categoryKey: "research" },
    { key: "elementsOfAiCourse", icon: "school", categoryKey: "coursesTutorials" },
    { key: "aif360Toolkit", icon: "balance", categoryKey: "tools" },
    { key: "algorithmicJusticeLeague", icon: "gavel", categoryKey: "tools" },
    { key: "digitalEquity", icon: "laptop", categoryKey: "guidelines" },
    { key: "euGuidelines", icon: "policy", categoryKey: "guidelines" }
  ];

  const resources = resourcesData.map(res => ({
    ...res,
    title: t(`resources.items.${res.key}.title`),
    description: t(`resources.items.${res.key}.description`),
    category: t(`resources.categories.${res.categoryKey}`),
    link: t(`resources.items.${res.key}.link`)
  }));

  const categories = ["all", "guidelines", "research", "tools", "examples"];

  const filteredResources = selectedCategory === "All" 
    ? resources 
    : resources.filter(resource => resource.category === t(`resources.categories.${selectedCategory.toLowerCase()}`));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              {t("resources.hero.titlePart1")}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-800">
                  {t("resources.hero.titlePart2")}
                </span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-primary-100"></span>
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              {t("resources.hero.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((categoryKey) => {
              const categoryLabel = t(`resources.categories.${categoryKey}`);
              return (
                <Button
                  key={categoryKey}
                  variant="outline"
                  onClick={() => setSelectedCategory(categoryKey === 'all' ? 'All' : categoryLabel)}
                  className={
                    selectedCategory === (categoryKey === 'all' ? 'All' : categoryLabel)
                      ? "border-2 border-primary-300 bg-primary-50 text-slate-800 font-medium"
                      : "border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-primary-300 font-medium"
                  }
                >
                  {categoryLabel}
                </Button>
              );
            })}
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
                    <span className="text-base">{t("resources.learnMore")}</span>
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
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("resources.cta.title")}</h2>
                <p className="text-slate-600 mb-6">
                  {t("resources.cta.description")}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-2 flex items-center">
                      <span className="material-icons text-xl text-primary-800 mr-2">format_quote</span>
                      {t("resources.cta.prompts.title")}
                    </h3>
                    <p className="text-slate-600">
                      {t("resources.cta.prompts.description")}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-2 flex items-center">
                      <span className="material-icons text-xl text-primary-800 mr-2">assignment</span>
                      {t("resources.cta.activities.title")}
                    </h3>
                    <p className="text-slate-600">
                      {t("resources.cta.activities.description")}
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
