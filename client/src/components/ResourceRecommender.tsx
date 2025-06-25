import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Sparkles } from 'lucide-react';

interface Resource {
  key: string;
  title: string;
  description: string;
  category: string;
  categoryKey: string;
  tags: string[];
  difficulty: string;
  lastUpdated: string;
  link: string;
}

interface ResourceRecommenderProps {
  resources: Resource[];
  onApplyFilters?: (filters: { category?: string; difficulty?: string; tags?: string[] }) => void;
}

const gradeLevels = [
  { value: 'K-5', label: 'K-5 Elementary' },
  { value: '6-8', label: '6-8 Middle School' },
  { value: '9-12', label: '9-12 High School' },
  { value: 'Higher Ed', label: 'Higher Education' },
  { value: 'Admin', label: 'Administrator' },
  { value: 'Other', label: 'Other' }
];

const goals = [
  { value: 'ai-literacy', label: 'Teach AI literacy', categories: ['courses'], tags: ['AI Literacy', 'K-12', 'Curriculum'] },
  { value: 'bias', label: 'Address bias & fairness', categories: ['research', 'tools'], tags: ['Bias', 'Fairness', 'Discrimination'] },
  { value: 'lesson-plans', label: 'Find lesson plans', categories: ['courses'], tags: ['Lesson Plan', 'Curriculum', 'Teaching'] },
  { value: 'policy', label: 'Policy guidance', categories: ['guidelines', 'frameworks'], tags: ['Policy', 'Framework', 'Guidance'] },
  { value: 'tools', label: 'Find AI tools', categories: ['tools'], tags: ['AI Tool', 'Platform', 'Assessment'] },
  { value: 'other', label: 'Other', categories: [], tags: [] }
];

const experienceLevels = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' }
];

const ResourceRecommender: React.FC<ResourceRecommenderProps> = ({ resources, onApplyFilters }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grade, setGrade] = useState('');
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Get unique topics from resources (limited to most common ones)
  const allTopics = useMemo(() => {
    const topicCounts = new Map<string, number>();
    resources.forEach(r => {
      r.tags.forEach(tag => {
        topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([topic]) => topic);
  }, [resources]);

  // Smart recommendation logic
  const recommendations = useMemo(() => {
    if (!grade && !goal && !experience && topics.length === 0) {
      return [];
    }

    const scoredResources = resources.map(resource => {
      let score = 0;
      const resourceTags = resource.tags.map(t => t.toLowerCase());
      const resourceCategory = resource.categoryKey;

      // Grade level scoring (high weight)
      if (grade) {
        const gradeValue = grade.toLowerCase();
        if (gradeValue === 'k-5' && resourceTags.some(t => t.includes('k-12') || t.includes('k-5') || t.includes('elementary'))) {
          score += 10;
        } else if (gradeValue === '6-8' && resourceTags.some(t => t.includes('k-12') || t.includes('6-8') || t.includes('middle'))) {
          score += 10;
        } else if (gradeValue === '9-12' && resourceTags.some(t => t.includes('k-12') || t.includes('9-12') || t.includes('high school'))) {
          score += 10;
        } else if (gradeValue === 'higher ed' && resourceTags.some(t => t.includes('higher education') || t.includes('university') || t.includes('college'))) {
          score += 10;
        } else if (gradeValue === 'admin' && resourceTags.some(t => t.includes('admin') || t.includes('policy') || t.includes('governance'))) {
          score += 10;
        }
      }

      // Goal-based scoring (high weight)
      if (goal) {
        const goalConfig = goals.find(g => g.value === goal);
        if (goalConfig) {
          // Category match
          if (goalConfig.categories.includes(resourceCategory)) {
            score += 8;
          }
          // Tag matches
          goalConfig.tags.forEach(goalTag => {
            if (resourceTags.some(t => t.includes(goalTag.toLowerCase()))) {
              score += 6;
            }
          });
        }
      }

      // Experience level scoring (medium weight)
      if (experience && resource.difficulty === experience) {
        score += 5;
      }

      // Topic scoring (medium weight)
      topics.forEach(topic => {
        if (resource.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase()))) {
          score += 4;
        }
      });

      // Bonus for recent updates
      if (resource.lastUpdated === '2024' || resource.lastUpdated === '2025') {
        score += 1;
      }

      return { ...resource, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

    return scoredResources;
  }, [resources, grade, goal, experience, topics]);

  const hasAnswers = grade || goal || experience || topics.length > 0;

  const handleGetRecommendations = () => {
    setShowRecommendations(true);
  };

  const handleSeeAllMatching = () => {
    if (onApplyFilters) {
      const filters: { category?: string; difficulty?: string; tags?: string[] } = {
        tags: topics // Always include tags, even if empty array
      };
      
      if (goal) {
        const goalConfig = goals.find(g => g.value === goal);
        if (goalConfig && goalConfig.categories.length > 0) {
          filters.category = goalConfig.categories[0];
        }
      }
      
      if (experience) {
        filters.difficulty = experience;
      }
      
      onApplyFilters(filters);
      setIsModalOpen(false); // Close modal after applying filters
    }
  };

  const resetForm = () => {
    setGrade('');
    setGoal('');
    setExperience('');
    setTopics([]);
    setShowRecommendations(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowRecommendations(false);
  };

  return (
    <>
      {/* Search Bar Prompt */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Not sure where to start?
              </h3>
              <p className="text-sm text-blue-700">
                Take our quick quiz to get personalized resource recommendations
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Recommendations
          </Button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="recommender-title"
            aria-describedby="recommender-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 id="recommender-title" className="text-2xl font-bold text-blue-700">
                  Get Personalized Recommendations
                </h2>
                <p id="recommender-description" className="text-gray-600 mt-1">
                  Answer a few quick questions to find resources tailored to your needs
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                aria-label="Close recommendations"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Quiz Form */}
            <form className="space-y-6">
              <div>
                <label htmlFor="grade-level-select" className="block text-sm font-medium text-gray-700 mb-2">
                  What's your role or grade level?
                </label>
                <select
                  id="grade-level-select"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                >
                  <option value="">Select your role...</option>
                  {gradeLevels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                </select>
              </div>
              
              <div>
                <label htmlFor="main-goal-select" className="block text-sm font-medium text-gray-700 mb-2">
                  What's your main goal?
                </label>
                <select
                  id="main-goal-select"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                >
                  <option value="">Select your goal...</option>
                  {goals.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    How familiar are you with AI in education?
                  </legend>
                  <div className="flex gap-4 flex-wrap justify-center mt-3">
                    {experienceLevels.map(lvl => (
                      <label key={lvl.value} className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="experience"
                          value={lvl.value}
                          checked={experience === lvl.value}
                          onChange={() => setExperience(lvl.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{lvl.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              
              {allTopics.length > 0 && (
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">
                      Any specific topics of interest? (optional)
                    </legend>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {allTopics.map(topic => (
                        <label key={topic} className="inline-flex items-center gap-1 text-sm border border-gray-200 rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            value={topic}
                            checked={topics.includes(topic)}
                            onChange={e => {
                              if (e.target.checked) setTopics([...topics, topic]);
                              else setTopics(topics.filter(t => t !== topic));
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>{topic}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Get Recommendations Button */}
              {hasAnswers && !showRecommendations && (
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={handleGetRecommendations}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Get My Recommendations
                  </Button>
                </div>
              )}
            </form>

            {/* Recommendations Section - Only show after button click */}
            {showRecommendations && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Personalized Recommendations
                </h3>
                
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map(res => (
                      <div key={res.key} className="border border-gray-200 rounded-lg p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                        <a 
                          href={res.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium text-blue-700 hover:text-blue-800 hover:underline block text-lg"
                        >
                          {res.title}
                        </a>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{res.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">{res.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{res.difficulty}</Badge>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-3 pt-4">
                      {onApplyFilters && (
                        <Button 
                          onClick={handleSeeAllMatching}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          See all matching resources
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        onClick={resetForm}
                      >
                        Start over
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No resources match your specific criteria.</p>
                    <Button 
                      variant="outline"
                      onClick={resetForm}
                    >
                      Try different selections
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceRecommender; 