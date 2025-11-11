import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UserTutorial() {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tutorialSteps = [
    {
      icon: "account_circle",
      title: "Create Your Profile",
      description: "Set up your profile with your educational background and interests to get personalized recommendations.",
      details: [
        "Click the Sign In button in the top navigation",
        "Choose your preferred authentication method",
        "Complete your profile with educational information",
        "Select your areas of interest in AI ethics"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "explore",
      title: "Explore Scenarios",
      description: "Browse through carefully curated AI ethics scenarios covering real-world situations and dilemmas.",
      details: [
        "Navigate to the Scenarios page",
        "Use filters to find scenarios by topic or difficulty",
        "Read the scenario description carefully",
        "Consider the ethical implications before proceeding"
      ],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: "psychology",
      title: "Analyze & Think",
      description: "Use our guided analysis tools to explore different ethical frameworks and perspectives.",
      details: [
        "Read the scenario from multiple viewpoints",
        "Consider stakeholders and their interests",
        "Apply ethical frameworks (utilitarian, deontological, virtue ethics)",
        "Think about potential consequences and alternatives"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "edit",
      title: "Share Your Perspective",
      description: "Contribute your thoughtful analysis and reasoning to help others learn from your insights.",
      details: [
        "Click 'Add Your Perspective' on any scenario",
        "Write a clear, well-reasoned response",
        "Support your arguments with evidence",
        "Be respectful of different viewpoints"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: "thumb_up",
      title: "Engage with Community",
      description: "Read, like, and learn from perspectives shared by students and educators worldwide.",
      details: [
        "Browse perspectives using different ranking methods",
        "Like high-quality contributions",
        "Learn from diverse viewpoints and reasoning",
        "Engage respectfully with the community"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: "emoji_events",
      title: "Track Your Progress",
      description: "Monitor your learning journey with achievements, progress tracking, and personal analytics.",
      details: [
        "Visit your Dashboard to see progress",
        "Earn achievements for various activities",
        "Track your contribution quality scores",
        "Set learning goals and monitor completion"
      ],
      color: "from-pink-500 to-pink-600"
    }
  ];

  const features = [
    {
      icon: "lightbulb",
      title: "AI-Powered Insights",
      description: "Get intelligent analysis and suggestions based on your contributions and learning patterns."
    },
    {
      icon: "trending_up",
      title: "Smart Rankings",
      description: "Discover the best perspectives through our sophisticated ranking algorithms that prioritize quality."
    },
    {
      icon: "language",
      title: "Multiple Languages",
      description: "Access content in 7 languages to ensure global accessibility and inclusive learning."
    },
    {
      icon: "accessibility",
      title: "Accessibility Tools",
      description: "Use built-in accessibility controls for font size, contrast, and screen reader optimization."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Back Button */}
      <div className="fixed top-24 left-6 z-50">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/about")}
          className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200/50 text-gray-600 hover:text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 rounded-full p-2"
        >
          <span className="material-icons">arrow_back</span>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-medium">
                📚 Student Guide
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block">How to Use</span>
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Ethical Compass
              </span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Your complete guide to navigating ethical scenarios, contributing meaningful perspectives, 
              and developing critical thinking skills for the AI era.
            </p>
            
            {/* Quick Start Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/scenarios")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="material-icons mr-2">play_arrow</span>
                Start Learning Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/about")}
                className="border-2 border-blue-300 hover:border-blue-500 text-blue-700 hover:text-blue-800 font-bold px-8 py-4 text-lg transition-all duration-300"
              >
                <span className="material-icons mr-2">info</span>
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Learning Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these steps to become proficient in AI ethics analysis and critical thinking
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorialSteps.map((step, index) => (
              <Card key={index} className="relative group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className={`bg-gradient-to-br ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-icons text-white text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                  
                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start">
                        <span className="material-icons text-gray-400 text-sm mr-2 mt-1">check_circle</span>
                        <span className="text-sm text-gray-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-gray-100">
                    <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the powerful tools and features designed to enhance your learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-icons text-white text-xl">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Tips for Success */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tips for Success</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Best practices to maximize your learning and contribution to the community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-icons text-white text-2xl">tips_and_updates</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality over Quantity</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">check</span>
                    Focus on thoughtful, well-reasoned perspectives
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">check</span>
                    Support your arguments with evidence and examples
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">check</span>
                    Consider multiple stakeholder perspectives
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">check</span>
                    Use proper grammar and clear writing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-icons text-white text-2xl">groups</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Engagement</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">check</span>
                    Read and learn from other perspectives
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">check</span>
                    Like high-quality contributions to support others
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">check</span>
                    Be respectful of different viewpoints
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">check</span>
                    Contribute regularly to build your reputation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-white text-3xl">school</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Begin?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Start your journey in AI ethics education with our carefully curated scenarios and supportive community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/scenarios")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="material-icons mr-2">rocket_launch</span>
                  Explore Scenarios
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="border-2 border-indigo-300 hover:border-indigo-500 text-indigo-700 hover:text-indigo-800 font-bold px-8 py-4 text-lg transition-all duration-300"
                >
                  <span className="material-icons mr-2">dashboard</span>
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 